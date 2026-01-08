import type { Resume } from "./parse-resume.js";

export interface TailoredResume {
  summary: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    location: string;
    period: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    status?: string;
  }[];
  languages: string[];
}

export function escapeTypst(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/#/g, "\\#")
    .replace(/\$/g, "\\$")
    .replace(/@/g, "\\@")
    .replace(/</g, "\\<")
    .replace(/>/g, "\\>");
}

export function generateTypst(
  profile: Resume["profile"],
  tailored: TailoredResume
): string {
  const name = escapeTypst(profile.name);
  const summary = escapeTypst(tailored.summary);

  const contactParts: string[] = [];
  if (profile.email) contactParts.push(escapeTypst(profile.email));
  if (profile.phone) contactParts.push(escapeTypst(profile.phone));
  if (profile.github)
    contactParts.push(`#link("https://${profile.github}")[${escapeTypst(profile.github)}]`);
  if (profile.linkedin)
    contactParts.push(`#link("https://${profile.linkedin}")[${escapeTypst(profile.linkedin)}]`);
  if (profile.location) contactParts.push(escapeTypst(profile.location));

  const contact = contactParts.join(" | ");

  const skills = tailored.skills.map((s) => escapeTypst(s)).join(", ");

  const experience = tailored.experience
    .map((exp) => {
      const bullets = exp.bullets
        .map((b) => `  - ${escapeTypst(b)}`)
        .join("\n");
      return `#resume-entry[${escapeTypst(exp.company)}][${escapeTypst(exp.role)}][${escapeTypst(exp.location)}][${escapeTypst(exp.period)}]
${bullets}`;
    })
    .join("\n\n");

  const education = tailored.education
    .map(
      (edu) => `*${escapeTypst(edu.degree)}* #h(1fr) ${escapeTypst(edu.startDate)} - ${escapeTypst(edu.endDate)}
${escapeTypst(edu.institution)} #h(1fr) ${edu.status ? `_(${escapeTypst(edu.status)})_` : ""}`
    )
    .join("\n\n");

  const languages = `■ ${tailored.languages.map((l) => escapeTypst(l)).join("    ")}`;

  return `#set page(margin: (x: 0.75in, y: 0.75in))
#set text(font: "New Computer Modern", size: 10pt)
#set par(justify: true)

#let section(title) = {
  v(8pt)
  text(weight: "bold", size: 11pt)[#title]
  v(-4pt)
  line(length: 100%, stroke: 0.5pt)
  v(4pt)
}

#let resume-entry(company, role, location, period) = {
  grid(
    columns: (1fr, auto),
    align: (left, right),
    [*#company* | #role | #location],
    [#period]
  )
}

// Header
#align(center)[
  #text(size: 18pt, weight: "bold")[${name}]
  #v(-6pt)
  ${contact}
]

#v(4pt)
${summary}

#section[Main technologies & Skills]
${skills}

#section[Professional Experience]
${experience}

#section[Education]
${education}

#section[Languages]
${languages}
`;
}
