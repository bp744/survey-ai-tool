import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractQuestionsFromText } from '@/lib/documentParser';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

interface AnalysisResult {
  templateSuggestion: string;
  questionImprovement: string | null;
  optionImprovements: string[] | null;
  logicFeedback?: string | null;
  reasoning: string;
  originalQuestion?: string;
  originalOptions?: string[];
  questionId?: string;
  questionType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate API key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Google Gemini API key not configured. Please check your .env.local file.' },
        { status: 500 }
      );
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // For docx files, we do basic text extraction
    // The Office Open XML format contains text in XML
    let text = '';
    try {
      // Try to extract text from the zip-based docx format
      // DOCX is essentially a ZIP file with XML inside
      const textContent = buffer.toString('utf-8', 0, Math.min(buffer.length, 1000000));
      // Extract readable text by removing XML tags
      text = textContent
        .replace(/<\/?[^>]+(>|$)/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (e) {
      text = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, '');
    }

    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: 'Could not extract text from document. Please ensure the docx file contains readable text.' },
        { status: 400 }
      );
    }

    // Extract questions from the text
    const questions = extractQuestionsFromText(text);

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found in document. Please use formats like "Q1. Question text [SS]" or "1. Question text?" followed by options.' },
        { status: 400 }
      );
    }

    // Analyze each question with Gemini
    const analysisResults: AnalysisResult[] = [];
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    for (const question of questions.slice(0, 5)) {
      // Limit to first 5 for API cost

      // Build metadata info string if available
      const metadataInfo = question.metadata
        ? `\nMETADATA:\n${question.metadata.randomize ? '- Randomize: Yes' : ''}${
            question.metadata.disqualifyConditions?.length
              ? `\n- Disqualify conditions: ${question.metadata.disqualifyConditions.join('; ')}`
              : ''
          }${
            question.metadata.skipLogic?.length
              ? `\n- Skip logic: ${question.metadata.skipLogic.join('; ')}`
              : ''
          }`
        : '';

      const prompt = `You are an expert in professional survey design and questionnaire formatting.

Analyze this survey question and its options:

QUESTION ID: ${question.id || 'N/A'}
QUESTION TEXT: ${question.question}
QUESTION TYPE CODE: ${question.questionType || question.type}
OPTIONS:
${question.options.map((opt, i) => `  ${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}
${metadataInfo}

Please provide:
1. The most suitable professional template for this question (e.g., Single-Select, Multiple-Select, Likert Scale, Rating Scale, Numeric Input, Open-Ended, Matrix/Grid, Ranking, etc.)
2. If the question text can be improved while keeping the same context and maintaining compliance, suggest an improved version. If no improvement is needed, say "No improvement needed."
3. If any option text can be improved while keeping the same meaning and making them more balanced/neutral, suggest improved versions. Otherwise, say "No improvements needed."
4. Any observations about the skip logic or disqualify conditions - are they appropriate? Any improvements?
5. Brief reasoning for your suggestions.

Format your response as JSON with this structure:
{
  "templateSuggestion": "template name",
  "questionImprovement": "improved question or null",
  "optionImprovements": ["improved option 1", "improved option 2"] or null,
  "logicFeedback": "feedback on skip/disqualify logic or null",
  "reasoning": "explanation of suggestions"
}`;

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            analysisResults.push({
              ...analysis,
              originalQuestion: question.question,
              originalOptions: question.options,
              questionId: question.id,
              questionType: question.questionType
            });
          }
        } catch (e) {
          console.error('Failed to parse Gemini response:', responseText);
          analysisResults.push({
            templateSuggestion: 'Unable to determine',
            questionImprovement: null,
            optionImprovements: null,
            logicFeedback: null,
            reasoning: 'Analysis failed - could not parse response',
            originalQuestion: question.question,
            originalOptions: question.options,
            questionId: question.id,
            questionType: question.questionType
          });
        }
      } catch (apiError) {
        console.error('Gemini API error:', apiError);
        analysisResults.push({
          templateSuggestion: 'API Error',
          questionImprovement: null,
          optionImprovements: null,
          logicFeedback: null,
          reasoning: 'Failed to analyze with Google Gemini API',
          originalQuestion: question.question,
          originalOptions: question.options,
          questionId: question.id,
          questionType: question.questionType
        });
      }
    }

    return NextResponse.json({
      questionCount: questions.length,
      analysis: analysisResults
    });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document. Please check the file format and try again.' },
      { status: 500 }
    );
  }
}
