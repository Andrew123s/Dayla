# Cursor Control Rules (Strict Enforcement)

## Mandatory File References
You must follow:
- /docs/01_architecture.md
- /docs/02_setup.md
- /docs/03_rules.md

These files define the source of truth for architecture, setup, and constraints.

## Execution Constraints
- Only create or modify files inside `/dayla_flutter`
- Do not touch any existing files outside this directory
- Do not introduce new libraries beyond those defined
- Do not change architecture decisions

## Source of Truth
- The existing Dayla web app defines:
  - UI
  - Flows
  - Navigation
  - API usage
- Do not invent or deviate from it

## Implementation Rules
- No placeholder code
- All screens must be functional
- Navigation must be wired
- API calls must use real endpoints

## Pre-Execution Requirement
Before writing code:
1. Read relevant sections from `/docs/*.md`
2. Identify affected layers (UI, state, data)
3. Follow defined structure exactly

## Post-Execution Validation
After writing code, you must verify:
- No files outside `/dayla_flutter` were modified
- Folder structure matches `01_architecture.md`
- No placeholder widgets or dummy data exist
- State management uses Riverpod only
- Routing uses go_router only

If any rule is violated:
- Fix it immediately before finishing

## Output Discipline
- Only produce necessary code
- Do not include explanations unless requested
- Keep files consistent with project structure

## Drift Prevention
- Do not reinterpret rules
- Do not simplify constraints
- Always re-check `/docs/*.md` before continuing