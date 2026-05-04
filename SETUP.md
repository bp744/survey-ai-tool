# Setup Guide for Survey Question Analyzer

## Quick Start

### 1. Get Your Claude API Key
- Visit [console.anthropic.com](https://console.anthropic.com)
- Sign up or log in
- Navigate to the API keys section
- Create a new API key and copy it

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Open .env.local in your editor and paste your API key:
# ANTHROPIC_API_KEY=your_actual_api_key_here
```

### 3. Install and Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Open http://localhost:3000
```

## Preparing Your Survey Documents

The tool analyzes survey questions from Word documents (.docx files). Here's how to format them:

### Supported Question Formats

**Format 1: Numbered with letter options**
```
1. How satisfied are you with our service?
   A) Very satisfied
   B) Satisfied
   C) Neutral
   D) Dissatisfied
   E) Very dissatisfied

2. Which features do you use most?
   A) Feature A
   B) Feature B
   C) Feature C
   D) Unsure
```

**Format 2: Bullet points with dashes**
```
Question: What is your age group?
- 18-25
- 26-35
- 36-45
- 46-55
- 56+
```

**Format 3: Numbered with numbered options**
```
1. Rate your agreement with this statement
   1) Strongly Agree
   2) Agree
   3) Neutral
   4) Disagree
   5) Strongly Disagree
```

### Best Practices

1. **Keep questions clear** - Use simple, direct language
2. **Consistent formatting** - Use the same format throughout your document
3. **Complete options** - Ensure each question has at least 2 options
4. **One question per block** - Separate questions with line breaks
5. **Avoid special characters** - Stick to standard text characters

## Using the Application

### Step 1: Upload Document
- Click the upload area or drag-and-drop your .docx file
- The app validates the file format

### Step 2: Analyze
- Click "Analyze Document"
- Wait while the app processes your questions
- The status updates in real-time

### Step 3: Review Results
For each question, you'll see:
- **Suggested Template** - The ideal format (Likert Scale, Matrix, etc.)
- **Question Improvement** - Rewording suggestions (if needed)
- **Option Improvements** - Better wording for options (if needed)
- **Reasoning** - Why these changes are recommended

## Understanding the Suggestions

### Template Types
- **Multiple Choice** - Pick one option from many
- **Likert Scale** - Agree/Disagree on a scale
- **Rating Scale** - Numerical or star ratings
- **Ranking** - Order items by preference
- **Matrix** - Rate multiple items on the same scale
- **Short Answer** - Open-ended text response
- **Boolean** - Yes/No questions

### Improvement Indicators
- ✓ Green highlights: Option improvements
- ⚠ Yellow highlights: Question wording improvements
- ℹ Blue highlights: Reasoning and explanations

## Troubleshooting

### API Key Issues
- Error: "API key is not valid?"
  - Check that you've copied the key correctly from console.anthropic.com
  - Ensure no spaces or extra characters in .env.local

### Document Not Processing
- Error: "No questions found in document"
  - Check your question formatting matches the examples above
  - Ensure questions are numbered or clearly separated
  - Avoid scanned images - use text-based Word documents

### Analysis Failed
- Error: "Failed to process document"
  - Check your internet connection
  - Verify your Claude API key is valid
  - Try with a smaller document first
  - Check browser console for more details (F12)

## Performance Tips

- **Start small** - Test with 3-5 questions first
- **Check limits** - Currently analyzes first 5 questions to manage costs
- **Format matters** - Better formatted docs extract faster

## API Rate Limits

Claude API has rate limits:
- Free trial: Limited tokens
- Paid account: Higher limits available

The tool is optimized to analyze 5 questions per document to manage costs. Each analysis uses approximately 1000-2000 tokens.

## Getting More Help

- Claude API docs: https://docs.anthropic.com
- Claude Web: https://claude.ai
- GitHub Issues: Report bugs or request features
