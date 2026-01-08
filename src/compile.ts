import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

export function compileTypst(inputPath: string, outputPath: string): void {
  try {
    execSync("which typst", { stdio: "ignore" });
  } catch {
    throw new Error(
      "Typst not found. Install it with: brew install typst"
    );
  }

  if (!existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  try {
    execSync(`typst compile "${inputPath}" "${outputPath}"`, {
      stdio: "inherit",
    });
  } catch {
    throw new Error("Failed to compile Typst file");
  }
}
