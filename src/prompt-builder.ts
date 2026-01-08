import type { Resume } from "./parse-resume.js";

export function buildPrompt(resume: Resume, jobDescription: string): string {
  return `You are a professional resume writer. Your task is to tailor the following resume for a specific job position.

## Critical Rules (DO NOT VIOLATE)

1. ONLY include skills/technologies that are explicitly listed in the original resume below
2. NEVER add technologies from the job description that are not in the original resume
3. NEVER fabricate or exaggerate achievements - you may only enhance wording of existing bullets
4. If the candidate lacks a required skill, do NOT add it - focus on transferable skills they DO have
5. STAR method rewrites must be based on the original bullet points, not invented

## Instructions

1. **ATS Optimization**: Use keywords from the job description ONLY if they match skills already in the resume
2. **STAR Method**: Rewrite each bullet point using the STAR method (Situation, Task, Action, Result). Keep bullets concise (1-2 lines each). Base rewrites on the original content.
3. **Relevance**: Prioritize and reorder experiences/skills that are most relevant to the job
4. **Professional Summary**: Update the summary to highlight fit for this specific role using only the candidate's actual experience

## Current Resume

**Name**: ${resume.profile.name}
${resume.profile.email ? `**Email**: ${resume.profile.email}` : ""}
${resume.profile.github ? `**GitHub**: ${resume.profile.github}` : ""}
${resume.profile.linkedin ? `**LinkedIn**: ${resume.profile.linkedin}` : ""}
${resume.profile.summary ? `**Summary**: ${resume.profile.summary}` : ""}

### Skills
${resume.skills.map((s) => `- ${s}`).join("\n")}

### Professional Experience
${resume.experience
  .map(
    (exp) => `
**${exp.company}** | ${exp.role} | ${exp.period}
${exp.bullets.map((b) => `- ${b}`).join("\n")}`
  )
  .join("\n")}

### Education
${resume.education.map((edu) => `- ${edu.degree} | ${edu.institution} | ${edu.year}`).join("\n")}

### Languages
${resume.languages.map((l) => `- ${l}`).join("\n")}

## Job Description

${jobDescription}

## Output Format

Respond with ONLY a JSON object (no markdown code blocks, no explanation) in this exact format:

{
  "summary": "Updated professional summary tailored to this role",
  "skills": ["skill1", "skill2", "..."],
  "experience": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "period": "Start - End",
      "bullets": ["STAR-formatted bullet 1", "STAR-formatted bullet 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree",
      "institution": "Institution",
      "year": "Year"
    }
  ],
  "languages": ["Language (Proficiency)"]
}`;
}
