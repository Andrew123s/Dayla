# Project Setup Instructions

## Root Constraint
- All work must be inside: `/dayla_flutter`
- Do not modify any existing project files.

## Initialization
1. Create folder:
   /dayla_flutter

2. Initialize Flutter project (latest stable SDK)

3. Enable platforms:
   - Android
   - iOS
   - Web

## Dependencies
Add:
- flutter_riverpod
- go_router
- dio
- freezed + build_runner (if needed)
- json_serializable (if needed)

## Core Setup

### main.dart
- Wrap app with ProviderScope
- Initialize app entry point
- Configure router

### Routing
- Set up go_router
- Define initial routes based on web app structure

### Theme
- Use Material 3
- Extract colors and typography from web app
- Define global theme in `core/theme/`

### Networking
- Create API client using Dio
- Set:
  - Base URL
  - Interceptors (auth, logging)

### Folder Structure
Implement base structure:

lib/
  core/
  features/

## Initial Implementation Requirement
- Navigation must be functional
- At least primary routes must load real screens (not placeholders)
- Screens can be minimal but must be real and connected

## Assets
- Reuse assets from existing project
- Organize under:
  /assets/