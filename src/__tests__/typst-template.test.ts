import { describe, it, expect } from "vitest";
import {
  generateTypst,
  escapeTypst,
  type TailoredResume,
} from "../typst-template.js";
import type { Resume } from "../parse-resume.js";

describe("escapeTypst", () => {
  it("escapes backslashes", () => {
    expect(escapeTypst("path\\to\\file")).toBe("path\\\\to\\\\file");
  });

  it("escapes hash symbols", () => {
    expect(escapeTypst("C# developer")).toBe("C\\# developer");
  });

  it("escapes dollar signs", () => {
    expect(escapeTypst("$100k salary")).toBe("\\$100k salary");
  });

  it("escapes at symbols", () => {
    expect(escapeTypst("email@example.com")).toBe("email\\@example.com");
  });

  it("escapes angle brackets", () => {
    expect(escapeTypst("<script>")).toBe("\\<script\\>");
  });

  it("handles multiple special characters", () => {
    expect(escapeTypst("C# $100 @work <tag>")).toBe(
      "C\\# \\$100 \\@work \\<tag\\>"
    );
  });

  it("handles empty string", () => {
    expect(escapeTypst("")).toBe("");
  });

  it("handles string with no special characters", () => {
    expect(escapeTypst("normal text")).toBe("normal text");
  });
});

describe("generateTypst", () => {
  const profile: Resume["profile"] = {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 555-1234",
    location: "New York, USA",
    github: "github.com/johndoe",
    linkedin: "linkedin.com/in/johndoe",
  };

  const tailored: TailoredResume = {
    summary: "Senior engineer with expertise in React",
    skills: ["TypeScript", "React", "Node.js"],
    experience: [
      {
        company: "Acme Corp",
        role: "Senior Engineer",
        location: "Remote",
        period: "2020 - Present",
        bullets: ["Led team of 5", "Built scalable API"],
      },
    ],
    education: [{ degree: "B.S. CS", institution: "MIT", startDate: "2016", endDate: "2018" }],
    languages: ["English (Native)"],
  };

  it("generates valid typst document", () => {
    const result = generateTypst(profile, tailored);

    expect(result).toContain('#set page(margin: (x: 0.75in, y: 0.75in))');
    expect(result).toContain('#set text(font: "New Computer Modern"');
  });

  it("includes name in header", () => {
    const result = generateTypst(profile, tailored);

    expect(result).toContain("John Doe");
  });

  it("includes contact info with links", () => {
    const result = generateTypst(profile, tailored);

    expect(result).toContain("john\\@example.com");
    expect(result).toContain("+1 555-1234");
    expect(result).toContain("New York, USA");
    expect(result).toContain('#link("https://github.com/johndoe")');
    expect(result).toContain('#link("https://linkedin.com/in/johndoe")');
  });

  it("includes summary", () => {
    const result = generateTypst(profile, tailored);

    expect(result).toContain("Senior engineer with expertise in React");
  });

  it("includes skills section", () => {
    const result = generateTypst(profile, tailored);

    expect(result).toContain("#section[Main technologies & Skills]");
    expect(result).toContain("TypeScript, React, Node.js");
  });

  it("includes experience section with location", () => {
    const result = generateTypst(profile, tailored);

    expect(result).toContain("#section[Professional Experience]");
    expect(result).toContain("#resume-entry[Acme Corp][Senior Engineer][Remote][2020 - Present]");
    expect(result).toContain("- Led team of 5");
    expect(result).toContain("- Built scalable API");
  });

  it("includes education section", () => {
    const result = generateTypst(profile, tailored);

    expect(result).toContain("#section[Education]");
    expect(result).toContain("*B.S. CS*");
    expect(result).toContain("2016 - 2018");
    expect(result).toContain("MIT");
  });

  it("includes languages section with bullet", () => {
    const result = generateTypst(profile, tailored);

    expect(result).toContain("#section[Languages]");
    expect(result).toContain("■");
    expect(result).toContain("English (Native)");
  });

  it("handles missing optional profile fields", () => {
    const minimalProfile: Resume["profile"] = { name: "Jane Doe" };
    const result = generateTypst(minimalProfile, tailored);

    expect(result).toContain("Jane Doe");
    expect(result).not.toContain("#link");
  });

  it("handles profile with only email", () => {
    const emailProfile: Resume["profile"] = {
      name: "Jane",
      email: "jane@test.com",
    };
    const result = generateTypst(emailProfile, tailored);

    expect(result).toContain("jane\\@test.com");
  });

  it("handles multiple experiences", () => {
    const multiExpTailored: TailoredResume = {
      ...tailored,
      experience: [
        {
          company: "Company A",
          role: "Role A",
          location: "NYC",
          period: "2022",
          bullets: ["Bullet A"],
        },
        {
          company: "Company B",
          role: "Role B",
          location: "Remote",
          period: "2020",
          bullets: ["Bullet B"],
        },
      ],
    };

    const result = generateTypst(profile, multiExpTailored);

    expect(result).toContain("#resume-entry[Company A][Role A][NYC][2022]");
    expect(result).toContain("#resume-entry[Company B][Role B][Remote][2020]");
  });

  it("handles experience with no bullets", () => {
    const noBulletsTailored: TailoredResume = {
      ...tailored,
      experience: [
        { company: "Company", role: "Role", location: "", period: "2020", bullets: [] },
      ],
    };

    const result = generateTypst(profile, noBulletsTailored);

    expect(result).toContain("#resume-entry[Company][Role][][2020]");
  });

  it("escapes special characters in content", () => {
    const specialCharTailored: TailoredResume = {
      ...tailored,
      summary: "Expert in C# and $100k projects",
      skills: ["C#", "F#"],
    };

    const result = generateTypst(profile, specialCharTailored);

    expect(result).toContain("C\\#");
    expect(result).toContain("\\$100k");
  });

  it("handles multiple education entries", () => {
    const multiEduTailored: TailoredResume = {
      ...tailored,
      education: [
        { degree: "M.S.", institution: "Stanford", startDate: "2020", endDate: "2022" },
        { degree: "B.S.", institution: "MIT", startDate: "2018", endDate: "2020" },
      ],
    };

    const result = generateTypst(profile, multiEduTailored);

    expect(result).toContain("*M.S.*");
    expect(result).toContain("Stanford");
    expect(result).toContain("2020 - 2022");
    expect(result).toContain("*B.S.*");
    expect(result).toContain("2018 - 2020");
  });

  it("handles multiple languages with bullet and spacing", () => {
    const multiLangTailored: TailoredResume = {
      ...tailored,
      languages: ["English (Native)", "Spanish (Fluent)", "French (Basic)"],
    };

    const result = generateTypst(profile, multiLangTailored);

    expect(result).toContain("■");
    expect(result).toContain("English (Native)");
    expect(result).toContain("Spanish (Fluent)");
    expect(result).toContain("French (Basic)");
  });
});
