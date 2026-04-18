# Development Rules

## Absolute Constraints
- Do not modify or delete any existing files in the repository.
- Only write code inside `/dayla_flutter`.

## Parity Requirement
- Flutter app must match the web app:
  - Screens
  - Flows
  - Navigation
  - Behavior

## No Placeholder Rule
- Do not create dummy or temporary UI.
- Every screen must be:
  - Functional
  - Connected to navigation
  - Ready for extension

## Code Quality
- Write production-ready code from the start.
- Avoid hacks, shortcuts, or temporary fixes.

## API Usage
- Use existing backend endpoints exactly.
- Do not modify request/response structures.

## State Management Rules
- Do not use setState for business logic.
- All state must go through Riverpod.

## UI Rules
- Follow Material 3 strictly.
- Maintain visual consistency with web branding.

## Responsiveness Rules
- UI must adapt across:
  - Mobile
  - Tablet
  - Web

## File Discipline
- Keep files small and focused.
- Split widgets when complexity increases.

## Naming Conventions
- Features: snake_case
- Classes: PascalCase
- Variables: camelCase

## Execution Strategy
- Work incrementally:
  1. Structure
  2. Routing
  3. State
  4. UI
- Ensure each step is stable before continuing.

## Prohibited Actions
- No rewriting of architecture mid-way
- No introducing new frameworks
- No deviation from Riverpod or go_router