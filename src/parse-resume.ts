import { readFileSync } from "node:fs";

export interface Experience {
  company: string;
  role: string;
  period: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Resume {
  profile: {
    name: string;
    github?: string;
    linkedin?: string;
    email?: string;
    summary?: string;
  };
  skills: string[];
  experience: Experience[];
  education: Education[];
  languages: string[];
}

export function parseResume(filePath: string): Resume {
  const content = readFileSync(filePath, "utf-8");
  return parseResumeContent(content);
}

export function parseResumeContent(content: string): Resume {
  const sections = splitSections(content);

  return {
    profile: parseProfile(sections["PROFILE"] || ""),
    skills: parseSkills(sections["MAIN TECHS AND SKILLS"] || ""),
    experience: parseExperience(sections["PROFESSIONAL EXPERIENCE"] || ""),
    education: parseEducation(sections["EDUCATION"] || ""),
    languages: parseLanguages(sections["LANGUAGES"] || ""),
  };
}

function splitSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const sectionRegex = /^# (.+)$/gm;
  const matches = [...content.matchAll(sectionRegex)];

  for (let i = 0; i < matches.length; i++) {
    const name = matches[i][1].trim();
    const start = matches[i].index! + matches[i][0].length;
    const end = matches[i + 1]?.index ?? content.length;
    sections[name] = content.slice(start, end).trim();
  }

  return sections;
}

function parseProfile(section: string): Resume["profile"] {
  const lines = section.split("\n").filter((l) => l.trim());
  const profile: Resume["profile"] = { name: "" };

  for (const line of lines) {
    const nameMatch = line.match(/\*\*Name\*\*:\s*(.+)/);
    const githubMatch = line.match(/\*\*GitHub\*\*:\s*(.+)/);
    const linkedinMatch = line.match(/\*\*LinkedIn\*\*:\s*(.+)/);
    const emailMatch = line.match(/\*\*Email\*\*:\s*(.+)/);
    const summaryMatch = line.match(/\*\*Summary\*\*:\s*(.+)/);

    if (nameMatch) profile.name = nameMatch[1].trim();
    if (githubMatch) profile.github = githubMatch[1].trim();
    if (linkedinMatch) profile.linkedin = linkedinMatch[1].trim();
    if (emailMatch) profile.email = emailMatch[1].trim();
    if (summaryMatch) profile.summary = summaryMatch[1].trim();
  }

  return profile;
}

function parseSkills(section: string): string[] {
  return section
    .split("\n")
    .filter((l) => l.trim().startsWith("-"))
    .map((l) => l.replace(/^-\s*/, "").trim());
}

function parseExperience(section: string): Experience[] {
  const experiences: Experience[] = [];
  const entries = section.split(/^## /m).filter((e) => e.trim());

  for (const entry of entries) {
    const lines = entry.split("\n");
    const header = lines[0].trim();
    const headerMatch = header.match(/(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)/);

    if (headerMatch) {
      const bullets = lines
        .slice(1)
        .filter((l) => l.trim().startsWith("-"))
        .map((l) => l.replace(/^-\s*/, "").trim());

      experiences.push({
        company: headerMatch[1].trim(),
        role: headerMatch[2].trim(),
        period: headerMatch[3].trim(),
        bullets,
      });
    }
  }

  return experiences;
}

function parseEducation(section: string): Education[] {
  const education: Education[] = [];
  const entries = section.split(/^## /m).filter((e) => e.trim());

  for (const entry of entries) {
    const header = entry.split("\n")[0].trim();
    const headerMatch = header.match(/(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)/);

    if (headerMatch) {
      education.push({
        degree: headerMatch[1].trim(),
        institution: headerMatch[2].trim(),
        year: headerMatch[3].trim(),
      });
    }
  }

  return education;
}

function parseLanguages(section: string): string[] {
  return section
    .split("\n")
    .filter((l) => l.trim().startsWith("-"))
    .map((l) => l.replace(/^-\s*/, "").trim());
}
