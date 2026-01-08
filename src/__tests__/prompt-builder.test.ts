import { describe, it, expect } from "vitest";
import { buildPrompt } from "../prompt-builder.js";
import type { Resume } from "../parse-resume.js";

describe("buildPrompt", () => {
  const fullResume: Resume = {
    profile: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 555-1234",
      location: "New York, USA",
      github: "github.com/johndoe",
      linkedin: "linkedin.com/in/johndoe",
      summary: "Senior engineer",
    },
    skills: ["TypeScript", "React"],
    experience: [
      {
        company: "Acme Corp",
        role: "Senior Engineer",
        location: "Remote",
        period: "2020 - Present",
        bullets: ["Led team", "Built API"],
      },
    ],
    education: [{ degree: "B.S. CS", institution: "MIT", year: "2018" }],
    languages: ["English (Native)"],
  };

  it("includes all resume sections in prompt", () => {
    const prompt = buildPrompt(fullResume, "Job description here");

    expect(prompt).toContain("**Name**: John Doe");
    expect(prompt).toContain("**Email**: john@example.com");
    expect(prompt).toContain("**GitHub**: github.com/johndoe");
    expect(prompt).toContain("**LinkedIn**: linkedin.com/in/johndoe");
    expect(prompt).toContain("**Summary**: Senior engineer");
    expect(prompt).toContain("- TypeScript");
    expect(prompt).toContain("- React");
    expect(prompt).toContain("**Acme Corp** | Senior Engineer | Remote | 2020 - Present");
    expect(prompt).toContain("- Led team");
    expect(prompt).toContain("- Built API");
    expect(prompt).toContain("- B.S. CS | MIT | 2018");
    expect(prompt).toContain("- English (Native)");
  });

  it("includes job description", () => {
    const jobDesc = "Looking for a React developer with TypeScript experience";
    const prompt = buildPrompt(fullResume, jobDesc);

    expect(prompt).toContain("## Job Description");
    expect(prompt).toContain(jobDesc);
  });

  it("includes instructions for ATS and STAR", () => {
    const prompt = buildPrompt(fullResume, "Job");

    expect(prompt).toContain("ATS Optimization");
    expect(prompt).toContain("STAR Method");
    expect(prompt).toContain("Situation, Task, Action, Result");
  });

  it("includes JSON output format", () => {
    const prompt = buildPrompt(fullResume, "Job");

    expect(prompt).toContain("## Output Format");
    expect(prompt).toContain('"summary"');
    expect(prompt).toContain('"skills"');
    expect(prompt).toContain('"experience"');
    expect(prompt).toContain('"education"');
    expect(prompt).toContain('"languages"');
  });

  it("omits optional profile fields when missing", () => {
    const minimalResume: Resume = {
      profile: { name: "Jane Doe" },
      skills: [],
      experience: [],
      education: [],
      languages: [],
    };

    const prompt = buildPrompt(minimalResume, "Job");

    expect(prompt).toContain("**Name**: Jane Doe");
    expect(prompt).not.toContain("**Email**:");
    expect(prompt).not.toContain("**GitHub**:");
    expect(prompt).not.toContain("**LinkedIn**:");
    expect(prompt).not.toContain("**Summary**:");
  });

  it("handles multiple experiences", () => {
    const resume: Resume = {
      ...fullResume,
      experience: [
        {
          company: "Company A",
          role: "Role A",
          location: "NYC",
          period: "2022 - Present",
          bullets: ["Bullet A"],
        },
        {
          company: "Company B",
          role: "Role B",
          location: "Remote",
          period: "2020 - 2022",
          bullets: ["Bullet B"],
        },
      ],
    };

    const prompt = buildPrompt(resume, "Job");

    expect(prompt).toContain("**Company A** | Role A | NYC | 2022 - Present");
    expect(prompt).toContain("**Company B** | Role B | Remote | 2020 - 2022");
  });

  it("handles experience with no bullets", () => {
    const resume: Resume = {
      ...fullResume,
      experience: [
        {
          company: "Company",
          role: "Role",
          location: "",
          period: "2020",
          bullets: [],
        },
      ],
    };

    const prompt = buildPrompt(resume, "Job");

    expect(prompt).toContain("**Company** | Role |  | 2020");
  });

  it("handles multiple education entries", () => {
    const resume: Resume = {
      ...fullResume,
      education: [
        { degree: "M.S.", institution: "Stanford", year: "2020" },
        { degree: "B.S.", institution: "MIT", year: "2018" },
      ],
    };

    const prompt = buildPrompt(resume, "Job");

    expect(prompt).toContain("- M.S. | Stanford | 2020");
    expect(prompt).toContain("- B.S. | MIT | 2018");
  });
});
