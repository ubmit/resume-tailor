# resume-tailor

CLI that tailors resumes for specific job positions using Claude AI, outputs Typst + PDF.

## Prerequisites

- Node.js 18+
- pnpm
- [Typst](https://typst.app/) (`brew install typst`)
- Claude Pro subscription (or any Claude access via claude.ai)

## Installation

```bash
pnpm install
```

## Usage

### 1. Create your resume

**Option A: Start from scratch**
```bash
cp RESUME.md.example RESUME.md
```

**Option B: Extract from existing PDF**
```bash
pnpm extract -p your-resume.pdf
```
This creates `RESUME.md` with a template and extracted text at the bottom for reference.

Edit `RESUME.md` with your information following the format.

### 2. Generate the prompt

```bash
pnpm prepare:prompt -j job-description.txt > prompt.txt
```

### 3. Get Claude's response

1. Open [claude.ai](https://claude.ai)
2. Paste the contents of `prompt.txt`
3. Copy Claude's JSON response
4. Save it to `response.json`

### 4. Generate resume files

```bash
pnpm generate -i response.json
```

Outputs:
- `resume.typ` - Typst source (editable)
- `resume.pdf` - Compiled PDF

## CLI Reference

### `prepare`

Generate prompt for Claude from resume and job description.

```bash
pnpm dev prepare -j <job-file> [-r <resume-file>]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-j, --job <file>` | Job description file (required) | - |
| `-r, --resume <file>` | Resume markdown file | `RESUME.md` |

### `generate`

Generate resume files from Claude's JSON response.

```bash
pnpm dev generate -i <response-file> [-r <resume-file>] [-o <output>] [--no-pdf]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --input <file>` | Claude's JSON response file (required) | - |
| `-r, --resume <file>` | Resume markdown file (for profile info) | `RESUME.md` |
| `-o, --output <name>` | Output filename (without extension) | `resume` |
| `--no-pdf` | Skip PDF compilation | `false` |

### `extract`

Extract text from existing PDF resume to create RESUME.md template.

```bash
pnpm extract -p <pdf-file> [-o <output-file>]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --pdf <file>` | PDF resume file (required) | - |
| `-o, --output <file>` | Output markdown file | `RESUME.md` |

## RESUME.md Format

```markdown
# PROFILE

**Name**: Your Name
**Email**: your.email@example.com
**GitHub**: github.com/username
**LinkedIn**: linkedin.com/in/username
**Summary**: Brief professional summary

# MAIN TECHS AND SKILLS

- Skill category 1
- Skill category 2

# PROFESSIONAL EXPERIENCE

## Company Name | Role | Start - End
- Achievement or responsibility
- Another bullet point

## Another Company | Role | Start - End
- Achievement or responsibility

# EDUCATION

## Degree | Institution | Year

# LANGUAGES

- Language (Proficiency)
```

## How It Works

1. **Parse**: Reads `RESUME.md` into structured data
2. **Prompt**: Combines resume + job description into a prompt asking Claude to:
   - Optimize for ATS (Applicant Tracking Systems)
   - Rewrite bullets using STAR method (Situation, Task, Action, Result)
   - Prioritize relevant experience
3. **Generate**: Converts Claude's JSON response into Typst format
4. **Compile**: Uses Typst to generate PDF

## Project Structure

```
src/
├── index.ts          # CLI entry point (prepare/generate commands)
├── parse-resume.ts   # RESUME.md parser
├── prompt-builder.ts # Generates Claude prompt
├── typst-template.ts # Generates .typ file from tailored data
└── compile.ts        # Typst → PDF compilation
```

## Development

```bash
# Run in dev mode
pnpm dev <command>

# Build
pnpm build

# Run built version
node dist/index.js <command>

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## Testing

Tests use Vitest with 100% code coverage. Test files are in `src/__tests__/`.

## License

ISC
