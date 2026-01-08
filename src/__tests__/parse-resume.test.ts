import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseResumeContent, parseResume } from "../parse-resume.js";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

import { readFileSync } from "node:fs";

const mockReadFileSync = vi.mocked(readFileSync);

describe("parseResumeContent", () => {
  it("parses complete resume with 4-part experience header", () => {
    const content = `# PROFILE

**Name**: John Doe
**Email**: john@example.com
**Phone**: +1 555-1234
**Location**: New York, USA
**GitHub**: github.com/johndoe
**LinkedIn**: linkedin.com/in/johndoe
**Summary**: Senior engineer with 10 years experience

# MAIN TECHS AND SKILLS

- TypeScript, React
- Node.js, PostgreSQL

# PROFESSIONAL EXPERIENCE

## Acme Corp | Senior Engineer | Remote | 2020 - Present
- Led team of 5 engineers
- Built scalable API

## Startup Inc | Engineer | San Francisco | 2018 - 2020
- Developed frontend
- Improved performance by 50%

# EDUCATION

## B.S. Computer Science | MIT | 2016 | 2018

# LANGUAGES

- English (Native)
- Spanish (Fluent)
`;

    const result = parseResumeContent(content);

    expect(result.profile).toEqual({
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 555-1234",
      location: "New York, USA",
      github: "github.com/johndoe",
      linkedin: "linkedin.com/in/johndoe",
      summary: "Senior engineer with 10 years experience",
    });

    expect(result.skills).toEqual(["TypeScript, React", "Node.js, PostgreSQL"]);

    expect(result.experience).toHaveLength(2);
    expect(result.experience[0]).toEqual({
      company: "Acme Corp",
      role: "Senior Engineer",
      location: "Remote",
      period: "2020 - Present",
      bullets: ["Led team of 5 engineers", "Built scalable API"],
    });
    expect(result.experience[1]).toEqual({
      company: "Startup Inc",
      role: "Engineer",
      location: "San Francisco",
      period: "2018 - 2020",
      bullets: ["Developed frontend", "Improved performance by 50%"],
    });

    expect(result.education).toEqual([
      { degree: "B.S. Computer Science", institution: "MIT", startDate: "2016", endDate: "2018" },
    ]);

    expect(result.languages).toEqual(["English (Native)", "Spanish (Fluent)"]);
  });

  it("parses 3-part experience header with empty location", () => {
    const content = `# PROFESSIONAL EXPERIENCE

## Company | Role | 2020 - 2021
- Some bullet
`;

    const result = parseResumeContent(content);

    expect(result.experience[0]).toEqual({
      company: "Company",
      role: "Role",
      location: "",
      period: "2020 - 2021",
      bullets: ["Some bullet"],
    });
  });

  it("handles missing optional profile fields", () => {
    const content = `# PROFILE

**Name**: Jane Doe
`;

    const result = parseResumeContent(content);

    expect(result.profile.name).toBe("Jane Doe");
    expect(result.profile.email).toBeUndefined();
    expect(result.profile.phone).toBeUndefined();
    expect(result.profile.location).toBeUndefined();
    expect(result.profile.github).toBeUndefined();
    expect(result.profile.linkedin).toBeUndefined();
    expect(result.profile.summary).toBeUndefined();
  });

  it("handles empty sections", () => {
    const content = `# PROFILE

**Name**: Test User
`;

    const result = parseResumeContent(content);

    expect(result.skills).toEqual([]);
    expect(result.experience).toEqual([]);
    expect(result.education).toEqual([]);
    expect(result.languages).toEqual([]);
  });

  it("handles missing sections", () => {
    const content = "";

    const result = parseResumeContent(content);

    expect(result.profile.name).toBe("");
    expect(result.skills).toEqual([]);
    expect(result.experience).toEqual([]);
    expect(result.education).toEqual([]);
    expect(result.languages).toEqual([]);
  });

  it("handles experience without bullets (4-part header)", () => {
    const content = `# PROFESSIONAL EXPERIENCE

## Company | Role | Location | 2020 - 2021
`;

    const result = parseResumeContent(content);

    expect(result.experience[0].bullets).toEqual([]);
    expect(result.experience[0].location).toBe("Location");
  });

  it("handles malformed experience header", () => {
    const content = `# PROFESSIONAL EXPERIENCE

## Invalid Header Without Pipes
- Some bullet
`;

    const result = parseResumeContent(content);

    expect(result.experience).toEqual([]);
  });

  it("handles malformed education header", () => {
    const content = `# EDUCATION

## Invalid Header Without Pipes
`;

    const result = parseResumeContent(content);

    expect(result.education).toEqual([]);
  });

  it("handles multiple education entries", () => {
    const content = `# EDUCATION

## M.S. Computer Science | Stanford | 2020 | 2022
## B.S. Computer Science | MIT | 2018 | 2020
`;

    const result = parseResumeContent(content);

    expect(result.education).toHaveLength(2);
    expect(result.education[0]).toEqual({
      degree: "M.S. Computer Science",
      institution: "Stanford",
      startDate: "2020",
      endDate: "2022",
    });
    expect(result.education[1]).toEqual({
      degree: "B.S. Computer Science",
      institution: "MIT",
      startDate: "2018",
      endDate: "2020",
    });
  });

  it("trims whitespace from parsed values", () => {
    const content = `# PROFILE

**Name**:   Spaced Name
**Email**:   spaced@email.com

# MAIN TECHS AND SKILLS

-   Skill with spaces

# LANGUAGES

-   Language with spaces
`;

    const result = parseResumeContent(content);

    expect(result.profile.name).toBe("Spaced Name");
    expect(result.profile.email).toBe("spaced@email.com");
    expect(result.skills[0]).toBe("Skill with spaces");
    expect(result.languages[0]).toBe("Language with spaces");
  });
});

describe("parseResume", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads file and parses content", () => {
    const fileContent = `# PROFILE

**Name**: File User
`;
    mockReadFileSync.mockReturnValue(fileContent);

    const result = parseResume("/path/to/resume.md");

    expect(mockReadFileSync).toHaveBeenCalledWith("/path/to/resume.md", "utf-8");
    expect(result.profile.name).toBe("File User");
  });
});
