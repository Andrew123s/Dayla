# Architecture Guidelines

## Source of Truth
- The existing Dayla web app is the single source of truth.
- All UI, flows, logic, and API usage must be derived from it.
- Do not invent new patterns unless required for platform constraints.

## Core Architecture
Use a feature-first structure combined with clean architecture principles.

Project structure:

lib/
  core/
    theme/
    constants/
    utils/
    network/
  features/
    <feature_name>/
      presentation/
        screens/
        widgets/
      application/
        providers/
        controllers/
      data/
        models/
        repositories/
        datasources/

## State Management
- Use Riverpod (latest stable version).
- Prefer:
  - `NotifierProvider` or `AsyncNotifierProvider`
- Keep business logic out of UI widgets.

## Navigation
- Use `go_router`.
- Routing must mirror the web app structure.
- Centralize routes in a single configuration file.

## Data Layer
- Use repository pattern.
- API communication via a dedicated client (e.g., Dio).
- Separate:
  - DTOs (API models)
  - Domain models (if needed)

## Separation of Concerns
- UI: rendering only
- Providers: state + logic
- Repositories: data orchestration
- Services: external interactions

## Scalability Rules
- No feature should depend on another feature directly.
- Shared logic must go into `core/`.
- Avoid global state outside Riverpod.

## Responsiveness
- Use adaptive layouts:
  - Mobile
  - Tablet
  - Web
- Prefer:
  - LayoutBuilder
  - Breakpoints