import { readFile } from 'fs/promises';

interface Document {
  text: string;
  paragraphs: string[];
}

export async function parseDocxFile(buffer: Buffer): Promise<Document> {
  // Simple text extraction from buffer
  // For more robust parsing, you might want to use 'docx' package instead
  const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 100000));
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0);

  return {
    text,
    paragraphs
  };
}

export interface Question {
  id?: string; // Q1, Q2, etc.
  question: string;
  options: string[];
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'single-select' | 'multiple-select' | 'numeric' | 'unknown';
  questionType?: string; // SS, MS, Numeric OE, etc.
  metadata?: {
    randomize?: boolean;
    disqualifyConditions?: string[];
    skipLogic?: string[];
  };
}

export function extractQuestionsFromText(text: string): Question[] {
  const questions: Question[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Check for question ID on its own line (Q1., Q2., etc.)
    const qIdMatch = line.match(/^(Q\d+)\.?$/);

    if (qIdMatch) {
      const questionId = qIdMatch[1];
      i++;

      // The next line should be the question text and optional type code
      if (i >= lines.length) break;

      let questionLine = lines[i];
      let questionText = questionLine;
      let typeCode = '';

      // Check if question line has type code [SS], [MS], etc.
      const typeMatch = questionLine.match(/^(.+?)\s*\[([^\]]+)\]$/);
      if (typeMatch) {
        questionText = typeMatch[1].trim();
        typeCode = typeMatch[2];
      }

      i++;

      // Determine question type from code
      let questionType = 'unknown';
      let detectedType: Question['type'] = 'unknown';

      if (typeCode) {
        questionType = typeCode;
        if (typeCode.includes('SS')) detectedType = 'single-select';
        else if (typeCode.includes('MS')) detectedType = 'multiple-select';
        else if (typeCode.includes('Numeric')) detectedType = 'numeric';
        else if (typeCode.includes('OE')) detectedType = 'short-answer';
        else detectedType = 'unknown';
      }

      // Collect metadata
      const metadata = {
        randomize: typeCode?.includes('Randomize') ?? false,
        disqualifyConditions: [] as string[],
        skipLogic: [] as string[]
      };

      // Collect options and metadata
      const options: string[] = [];
      while (i < lines.length) {
        const currentLine = lines[i];

        // Check if this is another question (Q followed by number and period)
        if (/^Q\d+\.?$/.test(currentLine)) {
          break;
        }

        // Check for disqualify/skip logic
        if (currentLine.includes('Disqualify') || currentLine.includes('disqualify')) {
          metadata.disqualifyConditions.push(currentLine);
          i++;
          continue;
        }

        if (
          currentLine.includes('Skip') ||
          (currentLine.includes('if ') && !currentLine.match(/^[\-\*•a-dA-D0-9]/))
        ) {
          metadata.skipLogic.push(currentLine);
          i++;
          continue;
        }

        // Check if this is an option (starts with -, *, •, or letter/number)
        if (/^[\-\*•]|^[a-dA-D][\.\)]\s|^[0-9][\.\)]\s/.test(currentLine)) {
          // Clean up the option text
          const cleanOption = currentLine
            .replace(/^[\-\*•]\s*/, '')
            .replace(/^[a-dA-D][\.\)]\s*/, '')
            .replace(/^[0-9][\.\)]\s*/, '');

          if (cleanOption.length > 0) {
            options.push(cleanOption);
          }
        }
        // Plain text without markers (could be option without bullet)
        else if (currentLine.length > 0 && options.length > 0) {
          // If we have collected options, treat this as continuation or another option
          const isLikelyOption =
            !currentLine.includes('if ') &&
            !currentLine.includes('[') &&
            currentLine.length < 100;
          if (isLikelyOption) {
            options.push(currentLine);
          }
        }

        i++;
      }

      // Only add if we found a valid question with options
      if (questionText && options.length > 0) {
        questions.push({
          id: questionId,
          question: questionText,
          options,
          type: detectedType,
          questionType,
          metadata: Object.keys(metadata).some(k => {
            const v = metadata[k as keyof typeof metadata];
            return Array.isArray(v) ? v.length > 0 : v;
          })
            ? metadata
            : undefined
        });
      }
      continue;
    }

    // Legacy format support (numbered questions: 1., 2., etc.)
    if (/^\d+[\.\)]/.test(line)) {
      let questionText = line;
      const options: string[] = [];

      i++;

      // Collect options for legacy format
      while (i < lines.length) {
        const currentLine = lines[i];

        // Check if next question started
        if (/^\d+[\.\)]/.test(currentLine) || /^Q\d+\.?$/.test(currentLine)) {
          break;
        }

        // Detect options
        if (/^[a-dA-D][\.\)]\s|^[0-9][\.\)]\s|^[\-\*•]\s/.test(currentLine)) {
          const cleanOption = currentLine
            .replace(/^[a-dA-D][\.\)]\s*/, '')
            .replace(/^[0-9][\.\)]\s*/, '')
            .replace(/^[\-\*•]\s*/, '');

          if (cleanOption.length > 0) {
            options.push(cleanOption);
          }
        } else if (currentLine.length > 0 && options.length === 0) {
          questionText += ' ' + currentLine;
        }

        i++;
      }

      if (questionText && options.length > 0) {
        questions.push({
          question: questionText,
          options,
          type: options.length > 1 ? 'multiple-choice' : 'short-answer'
        });
      }
      continue;
    }

    i++;
  }

  return questions;
}

