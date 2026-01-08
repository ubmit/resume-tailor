#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync, writeFileSync } from "node:fs";
import { parseResume } from "./parse-resume.js";
import { buildPrompt } from "./prompt-builder.js";
import { generateTypst, type TailoredResume } from "./typst-template.js";
import { compileTypst } from "./compile.js";
import { extractPdfText, generateResumeTemplate } from "./extract-pdf.js";

const program = new Command();

program
  .name("resume-tailor")
  .description("CLI to tailor resumes for specific job positions")
  .version("1.0.0");

program
  .command("prepare")
  .description("Generate prompt for Claude from resume and job description")
  .requiredOption("-j, --job <file>", "Job description file")
  .option("-r, --resume <file>", "Resume markdown file", "RESUME.md")
  .action((options) => {
    const resume = parseResume(options.resume);
    const jobDescription = readFileSync(options.job, "utf-8");
    const prompt = buildPrompt(resume, jobDescription);
    console.log(prompt);
  });

program
  .command("generate")
  .description("Generate resume files from Claude's response")
  .requiredOption("-i, --input <file>", "File containing Claude's JSON response")
  .option("-r, --resume <file>", "Resume markdown file (for profile info)", "RESUME.md")
  .option("-o, --output <name>", "Output filename (without extension)", "resume")
  .option("--no-pdf", "Skip PDF compilation")
  .action((options) => {
    const resume = parseResume(options.resume);
    const responseText = readFileSync(options.input, "utf-8");

    let tailored: TailoredResume;
    try {
      tailored = JSON.parse(responseText);
    } catch {
      console.error("Error: Invalid JSON in response file");
      console.error("Make sure to copy Claude's entire JSON response");
      process.exit(1);
    }

    const typstContent = generateTypst(resume.profile, tailored);
    const typstPath = `${options.output}.typ`;
    const pdfPath = `${options.output}.pdf`;

    writeFileSync(typstPath, typstContent);
    console.log(`Generated: ${typstPath}`);

    if (options.pdf) {
      compileTypst(typstPath, pdfPath);
      console.log(`Generated: ${pdfPath}`);
    }
  });

program
  .command("extract")
  .description("Extract text from PDF resume to create RESUME.md template")
  .requiredOption("-p, --pdf <file>", "PDF resume file")
  .option("-o, --output <file>", "Output markdown file", "RESUME.md")
  .action(async (options) => {
    try {
      const text = await extractPdfText(options.pdf);
      const template = generateResumeTemplate(text);
      writeFileSync(options.output, template);
      console.log(`Generated: ${options.output}`);
      console.log("Edit the file to organize extracted text into sections");
    } catch (error) {
      console.error("Error extracting PDF:", (error as Error).message);
      process.exit(1);
    }
  });

program.parse();
