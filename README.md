# Survey Question Analyzer

An AI-powered tool that analyzes survey questions from Word documents and provides suggestions for:
- Suitable question templates (Likert Scale, Multiple Choice, etc.)
- Improvements to question wording while maintaining context
- Improvements to answer options

## Features

✨ **Document Upload** - Drag-and-drop or click to upload .docx files
🤖 **AI Analysis** - Uses Google Gemini API to analyze questions intelligently  
📋 **Template Suggestions** - Recommends appropriate question formats
💡 **Improvement Ideas** - Suggests better wording for questions and options
📊 **Batch Processing** - Analyzes multiple questions from a single document

## Setup

### Prerequisites
- Node.js 18+
- A Google Gemini API key (get one at https://makersuite.google.com/app/apikey)

### Installation

1. **Get a Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your API key

2. **Configure environment variables:**
   ```bash
   # Copy the example file
   cp .env.local.example .env.local
   
   # Edit .env.local and add your Gemini API key
   # GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Navigate to `http://localhost:3000`

## Usage

1. **Upload a Document**
   - Click the upload area or drag-and-drop a .docx file
   - The file should contain survey questions with options

2. **Analyze**
   - Click "Analyze Document"
   - The app will extract questions and send them to Gemini for analysis

3. **Review Suggestions**
   - See recommended templates for each question
   - Read suggestions for improving question wording
   - Review recommendations for option improvements
   - Understand the reasoning behind each suggestion

## How It Works

1. **Document Parsing** - Extracts questions and options from Word documents
2. **Question Detection** - Identifies questions using common formatting patterns
3. **AI Analysis** - Sends each question to Google Gemini for intelligent analysis
4. **Suggestions** - Returns template recommendations and improvement ideas
5. **Display** - Shows results in an easy-to-review format

## Question Format Support

The tool looks for questions in these formats:

```
1. Question text here?
   A) Option 1
   B) Option 2
   C) Option 3
   D) Option 4
```

Or:

```
Question 1: What is your opinion?
- Option 1
- Option 2
```

## API Reference

### POST /api/analyze

Upload a document and get analysis.

**Request:**
- Form data with `file` field containing a .docx file

**Response:**
```json
{
  "questionCount": 10,
  "analysis": [
    {
      "originalQuestion": "...",
      "originalOptions": [...],
## Troubleshooting

**Error: "API key not configured"**
- Ensure you've created `.env.local` file
- Check that `GOOGLE_GEMINI_API_KEY` is set correctly
- No spaces or extra characters in the key

**Error: "No questions found"**
- Verify your document uses the supported formats
- Ensure each question has at least one option
- Check that questions are properly formatted

**Error: "Failed to process document"**
- Check your internet connection
- Verify your Gemini API key is valid
- Try with a smaller document first

## Getting Help

- [Google AI Studio](https://makersuite.google.com/app/apikey) - Get your API key
- [Google Gemini Docs](https://ai.google.dev/docs) - API documentation
- [Google AI Models](https://ai.google.dev/models) - Available models

## License

MIT
```

## Performance Notes

- Currently analyzes the first 5 questions to manage API usage
- Each question uses Google Gemini 1.5 Flash model
- Processing time depends on document size and API response time
- Gemini API pricing: Check [Google AI pricing](https://ai.google.dev/pricing)

## Future Enhancements

- [ ] Support for PDF documents
- [ ] Batch analysis without question limit
- [ ] Save and compare multiple analysis results
- [ ] Export results as PDF or CSV
- [ ] Question response preview
- [ ] Share analysis results
- [ ] Support for other AI models
