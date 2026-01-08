import { readFileSync } from "node:fs";
import { PDFParse } from "pdf-parse";

export async function extractPdfText(filePath: string): Promise<string> {
  const buffer = readFileSync(filePath);
  const uint8Array = new Uint8Array(buffer);
  const parser = new PDFParse(uint8Array);
  await parser.load();
  const result = await parser.getText();
  return (result as { text: string }).text;
}

export function generateResumeTemplate(extractedText: string): string {
  return `# PROFILE

**Name**:
**Email**:
**GitHub**:
**LinkedIn**:
**Summary**:

# MAIN TECHS AND SKILLS

-

# PROFESSIONAL EXPERIENCE

## Company | Role | Start - End
-

# EDUCATION

## Degree | Institution | Year

# LANGUAGES

-

---
# Extracted PDF Text (for reference - delete this section when done)

${extractedText}
`;
}
