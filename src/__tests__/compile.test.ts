import { describe, it, expect, vi, beforeEach } from "vitest";
import { compileTypst } from "../compile.js";

vi.mock("node:child_process", () => ({
  execSync: vi.fn(),
}));

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
}));

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const mockExecSync = vi.mocked(execSync);
const mockExistsSync = vi.mocked(existsSync);

describe("compileTypst", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws if typst is not installed", () => {
    mockExecSync.mockImplementation((cmd) => {
      if (cmd === "which typst") {
        throw new Error("not found");
      }
      return Buffer.from("");
    });

    expect(() => compileTypst("input.typ", "output.pdf")).toThrow(
      "Typst not found. Install it with: brew install typst"
    );
  });

  it("throws if input file does not exist", () => {
    mockExecSync.mockReturnValue(Buffer.from(""));
    mockExistsSync.mockReturnValue(false);

    expect(() => compileTypst("missing.typ", "output.pdf")).toThrow(
      "Input file not found: missing.typ"
    );
  });

  it("throws if typst compile fails", () => {
    mockExecSync.mockImplementation((cmd) => {
      if (typeof cmd === "string" && cmd.includes("typst compile")) {
        throw new Error("compile error");
      }
      return Buffer.from("");
    });
    mockExistsSync.mockReturnValue(true);

    expect(() => compileTypst("input.typ", "output.pdf")).toThrow(
      "Failed to compile Typst file"
    );
  });

  it("compiles successfully when all conditions are met", () => {
    mockExecSync.mockReturnValue(Buffer.from(""));
    mockExistsSync.mockReturnValue(true);

    expect(() => compileTypst("input.typ", "output.pdf")).not.toThrow();
    expect(mockExecSync).toHaveBeenCalledWith("which typst", { stdio: "ignore" });
    expect(mockExecSync).toHaveBeenCalledWith(
      'typst compile "input.typ" "output.pdf"',
      { stdio: "inherit" }
    );
  });

  it("checks for typst before checking file", () => {
    const callOrder: string[] = [];

    mockExecSync.mockImplementation((cmd) => {
      if (cmd === "which typst") {
        callOrder.push("which");
      }
      return Buffer.from("");
    });
    mockExistsSync.mockImplementation(() => {
      callOrder.push("exists");
      return true;
    });

    compileTypst("input.typ", "output.pdf");

    expect(callOrder[0]).toBe("which");
    expect(callOrder[1]).toBe("exists");
  });
});
