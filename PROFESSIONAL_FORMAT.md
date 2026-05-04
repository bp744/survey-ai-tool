# Professional Survey Format Support

The Survey Question Analyzer now supports professional survey formats like the one provided by your client. 

## Supported Format

The tool recognizes and analyzes questions in this professional format:

```
Q1.
Question text here? [Question Type Code]

Option 1
Option 2
Option 3
Disqualify or Skip logic (optional)

Q2.
Next question? [Type Code, Additional attributes]

- Option A
- Option B
```

## Question Type Codes

The tool recognizes these standard question type codes:

| Code | Meaning | Template |
|------|---------|----------|
| SS | Single Select | Multiple Choice / Radio Button |
| MS | Multiple Select | Checkboxes |
| Numeric OE | Numeric Open-Ended | Numeric Input Field |
| OE | Open-Ended | Text Input |
| Matrix | Rating Matrix | Grid/Matrix Format |

### Example with Type Code
```
Q5.
Where did you generally watch cricket live match? [SS, Randomize]

Mobile only
Television Only
Both on Mobile & TV
```

## Special Attributes

### Randomize
Indicates options should be presented in random order:
```
[MS, Randomize]
```

### Skip & Disqualify Logic
The analyzer recognizes conditional logic:
```
Q3.
Please enter your Age in complete years. [Numeric OE]
Disqualify if less than 18 years

Q4.
Which sports did you watch? [MS, Randomize]

Cricket (Disqualify if not selected)
Soccer
Formula 1 Racing
Hockey
...
None of these [Disqualify]
```

## How Analysis Works with Professional Format

When you upload a document with professional survey format, the analyzer:

1. **Extracts Question Metadata**
   - Question ID (Q1, Q2, Q3)
   - Question Type Code (SS, MS, etc.)
   - Attributes (Randomize, etc.)

2. **Identifies Skip/Disqualify Rules**
   - Captures conditional logic
   - Flags any issues with disqualification

3. **Provides Enhanced Suggestions**
   - Comments on question type appropriateness
   - Reviews skip/disqualify conditions
   - Suggests improvements with compliance in mind

## Example Analysis Output

For a professional format question, You'll receive:

```json
{
  "questionId": "Q2",
  "questionType": "SS",
  "templateSuggestion": "Single-Select (Radio Button)",
  "questionImprovement": "Consider rewording to...",
  "optionImprovements": ["Option A could be clearer as..."],
  "logicFeedback": "The disqualify logic is appropriate",
  "reasoning": "Professional best practices suggest..."
}
```

## Mixed Document Format

The analyzer supports **mixed documents** - you can have both professional format (Q1, Q2) and legacy format (1., 2.) in the same document:

```
Q1.
Professional format question? [SS]

Option A
Option B

2. Legacy format question?
   A) Option 1
   B) Option 2
```

## Best Practices

### For Professional Surveys

1. **Use consistent ID format**: Q1, Q2, Q3 (not Q01, Q001)
2. **Clearly separate questions**: Use line breaks
3. **Place type code on same line**: `Q1. Question text [SS]`
4. **List options clearly**: One per line with or without bullets
5. **Put logic on its own line**: Place disqualify/skip conditions separately

### Good Example
```
Q1.
What is your primary occupation? [SS]

Software Engineer
Healthcare Professional
Education
Finance
Other

Q2.
How many years have you worked in this field? [Numeric OE]
Disqualify if less than 1 year

Q3.
Which tools do you use regularly? [MS, Randomize]

Tool A
Tool B
Tool C
Tool D
None of these [Disqualify]
```

### Avoid
```
Q1. Question [SS] - with extra text on same line
    Option 1 (indented options can be tricky)
  Q2.   (irregular spacing)
```

## Metadata Handling

The analyzer recognizes:
- **Randomize attribute** - Flags that options should be randomized
- **Disqualify conditions** - Notes when respondents don't qualify
- **Skip logic** - Identifies conditional branching
- **Type codes** - Uses to recommend templates

All metadata is included in the analysis report for reference.

## API Response Structure

When analyzing a professional format, the API returns:

```json
{
  "questionCount": 5,
  "analysis": [
    {
      "questionId": "Q1",
      "questionType": "SS",
      "templateSuggestion": "Single-Select",
      "questionImprovement": null,
      "optionImprovements": null,
      "logicFeedback": null,
      "reasoning": "...",
      "originalQuestion": "Q1. Question text?",
      "originalOptions": ["Option 1", "Option 2"]
    }
  ]
}
```

## Your Client's Format

Your client's format uses:
- Question IDs: Q1, Q2, Q3, Q4, Q5
- Type codes: SS, Numeric OE, MS
- Attributes: Randomize
- Logic: Disqualify conditions
- Options: Plain text, sometimes with notes (Disqualify if not selected)

The tool now fully supports this format! Simply upload .docx files with questions in this format, and get AI-powered analysis with:
- Template recommendations
- Question wording improvements
- Option clarity suggestions
- Skip/disqualify logic review
- Professional best practices feedback
