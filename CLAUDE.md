# Claude Code Instructions

## Project Overview

CLI tool that tailors resumes for job applications. Three commands:
1. `extract` - extracts text from existing PDF to create RESUME.md
2. `prepare` - generates prompt for user to paste into claude.ai
3. `generate` - converts Claude's JSON response into Typst/PDF

No LLM API keys needed - user manually interacts with claude.ai.

## Tech Stack

- TypeScript + Node.js (ESM)
- pnpm
- Commander (CLI)
- pdf-parse (PDF text extraction)
- Typst (PDF generation)

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | CLI entry, commander setup |
| `src/extract-pdf.ts` | Extracts text from PDF files |
| `src/parse-resume.ts` | Parses RESUME.md into typed object |
| `src/prompt-builder.ts` | Builds prompt for Claude |
| `src/typst-template.ts` | Generates .typ from tailored resume |
| `src/compile.ts` | Shells out to `typst compile` |

## Data Flow

```
existing.pdf (optional)
       ↓
   [extract]
       ↓
RESUME.md + job.txt
       ↓
   [prepare]
       ↓
   prompt.txt → user pastes to claude.ai → response.json
       ↓
   [generate]
       ↓
resume.typ + resume.pdf
```

## Types

```typescript
// From parse-resume.ts
interface Resume {
  profile: { name, email?, github?, linkedin?, summary? }
  skills: string[]
  experience: Experience[]  // { company, role, period, bullets }
  education: Education[]    // { degree, institution, year }
  languages: string[]
}

// From typst-template.ts (Claude's output format)
interface TailoredResume {
  summary: string
  skills: string[]
  experience: { company, role, period, bullets }[]
  education: { degree, institution, year }[]
  languages: string[]
}
```

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage (must stay above 90%)
pnpm test:coverage

# Watch mode
pnpm test:watch
```

Tests are in `src/__tests__/`. Each module has corresponding test file.

### Manual Testing

```bash
cp RESUME.md.example RESUME.md
echo "Job description here" > job.txt
pnpm dev prepare -j job.txt
echo '{"summary":"...","skills":[],"experience":[],"education":[],"languages":[]}' > response.json
pnpm dev generate -i response.json
```

## Common Tasks

### Add new RESUME.md field
1. Update `Resume` interface in `parse-resume.ts`
2. Update parser function
3. Update `buildPrompt` in `prompt-builder.ts`
4. Update JSON schema in prompt output format

### Modify Typst template
Edit `generateTypst()` in `src/typst-template.ts`. Escape special chars with `escapeTypst()`.

### Add CLI option
Edit commander setup in `src/index.ts`.

## Conventions

- kebab-case filenames
- No default exports
- Inline `export` on declarations
- Avoid unnecessary abstractions

## Issue Tracking

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

### Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
