import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateResumeTemplate } from "../extract-pdf.js";

// Note: extractPdfText is not unit tested as it requires real PDF binary data
// and mocking PDFParse is complex. It's tested via integration/manual testing.

describe("generateResumeTemplate", () => {
  it("generates template with extracted text", () => {
    const extractedText = "John Doe\nSoftware Engineer\nSkills: TypeScript";
    const result = generateResumeTemplate(extractedText);

    expect(result).toContain("# PROFILE");
    expect(result).toContain("**Name**:");
    expect(result).toContain("**Email**:");
    expect(result).toContain("# MAIN TECHS AND SKILLS");
    expect(result).toContain("# PROFESSIONAL EXPERIENCE");
    expect(result).toContain("# EDUCATION");
    expect(result).toContain("# LANGUAGES");
    expect(result).toContain("# Extracted PDF Text");
    expect(result).toContain(extractedText);
  });

  it("includes empty template sections", () => {
    const result = generateResumeTemplate("Some text");

    expect(result).toContain("## Company | Role | Start - End");
    expect(result).toContain("## Degree | Institution | Year");
  });

  it("handles empty extracted text", () => {
    const result = generateResumeTemplate("");

    expect(result).toContain("# PROFILE");
    expect(result).toContain("# Extracted PDF Text");
  });

  it("handles multiline extracted text", () => {
    const extractedText = `Line 1
Line 2
Line 3`;
    const result = generateResumeTemplate(extractedText);

    expect(result).toContain("Line 1");
    expect(result).toContain("Line 2");
    expect(result).toContain("Line 3");
  });

  it("preserves special characters in extracted text", () => {
    const extractedText = "C# developer with $100k+ experience @company <tech>";
    const result = generateResumeTemplate(extractedText);

    expect(result).toContain(extractedText);
  });
});
