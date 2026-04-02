# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dayla** is a nature & exploration planning app built as a **monorepo** with:
- A React/TypeScript **web app** (`apps/web/`)
- A React Native/Expo **mobile app** (`apps/mobile/`)
- **Shared packages** (`packages/`) for types, API, auth, socket, config, and utils
- A Node.js/Express **backend** (`backend/`)

Package management: **pnpm workspaces** + **Turborepo**.

## Monorepo Structure

```
dayla/
  apps/
    web/           # Vite + React web frontend
    mobile/        # Expo React Native mobile app
  packages/
    types/         # @dayla/types — shared TypeScript interfaces
    api/           # @dayla/api — authenticated fetch wrapper
    auth/          # @dayla/auth — token storage abstraction
    socket/        # @dayla/socket — Socket.io client
    config/        # @dayla/config — API URL config
    utils/         # @dayla/utils — shared utility functions
  backend/         # Express API server (unchanged)
```

## Commands

### Web App (`apps/web/`)
```bash
pnpm dev:web       # Start Vite dev server on port 3000
pnpm build:web     # Production build
# Or from apps/web/:
pnpm dev
pnpm build
```

### Mobile App (`apps/mobile/`)
```bash
pnpm dev:mobile    # Start Expo dev server
# Or from apps/mobile/:
npx expo start
npx expo start --android
npx expo start --ios
```

### Backend (`backend/`)
```bash
pnpm dev:backend   # Start with nodemon
# Or from backend/:
npm run dev
npm start
npm test
node scripts/seed.js
node scripts/check-setup.js
```

### Running together
Start the backend first, then either the web or mobile frontend. The Vite dev server proxies `/api` and `/socket.io` to the backend at `http://localhost:3005`. The mobile app connects directly to the backend via `API_BASE_URL`.

## Environment Variables

**Web App** (`apps/web/.env.local`):
- `GEMINI_API_KEY` — Google Gemini API key (also exposed as `VITE_API_KEY`)
- `VITE_API_URL` — Backend URL (empty in dev; Vite proxy handles it)
- `RESEND_API_KEY`, `EMAIL_FROM` — Email sending

**Mobile App**: Set `EXPO_PUBLIC_API_URL` (e.g. `http://10.0.2.2:3005` for Android emulator, `http://192.168.x.x:3005` for physical device).

**Backend** (`backend/.env`):
- `MONGO_URI` — MongoDB connection string (required)
- `JWT_SECRET` — Min 32 chars (required)
- `PORT` — Backend port; must match proxy/mobile config (set to `3005`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Media uploads
- `GOOGLE_AI_API_KEY` — Gemini AI for smart packing and suggestions
- `RESEND_API_KEY`, `EMAIL_FROM` — Transactional email via Resend
- `FRONTEND_URL` — For CORS and Socket.io allowed origins
- `WEATHER_API_KEY`, `MAPS_API_KEY` — Optional external APIs

## Architecture

### Web App (`apps/web/`)

State-based routing (no React Router). `App.tsx` holds global state and renders one of: `auth | dashboard | community | chat | profile` views. URL params are parsed manually for email verification (`?token=`) and board invitations (`?invitationId=`).

**Key files:**
- `App.tsx` — Root component; manages auth state, Socket.io initialization, friend requests, and the notification panel
- `types.ts` — Web-specific type re-exports (shared types live in `packages/types/`)
- `lib/api.ts` — `authFetch()` wrapper that injects the JWT from localStorage
- `lib/socket.ts` — Socket.io client singleton

**Components** (`components/`): `Dashboard`, `Community`, `ChatView`, `ProfileView`, `AuthView`, `Onboarding`, `VerifyEmail`, `AcceptInvitation`, `Navigation`, `SmartPacking`, `ClimatiqStatus`, `JoinGroup`

### Mobile App (`apps/mobile/`)

Uses React Navigation with bottom tabs (Dashboard, Community, Chat, Packing, Profile) and native stacks within each tab.

**Key structure:**
- `App.tsx` — Root: GestureHandlerRootView → SafeAreaProvider → AuthProvider → NavigationContainer
- `src/context/AuthContext.tsx` — Auth state with AsyncStorage persistence
- `src/services/api.ts` — `authFetch()` with AsyncStorage token
- `src/services/socket.ts` — Socket.io client for real-time features
- `src/navigation/` — AuthNavigator, TabNavigator, and per-tab stacks
- `src/screens/` — auth, dashboard, community, chat, packing, profile

### Shared Packages (`packages/`)

Platform-agnostic code shared between web and mobile:
- `@dayla/types` — All TypeScript interfaces (User, Trip, Post, Message, PackingList, etc.)
- `@dayla/config` — API base URL management
- `@dayla/auth` — Token storage abstraction (uses dependency injection)
- `@dayla/api` — Authenticated fetch wrapper
- `@dayla/socket` — Socket.io client singleton with helpers
- `@dayla/utils` — Formatting, truncation, initials, etc.

### Backend

Standard Express app with routes → controllers → services layering.

**Entry:** `backend/server.js` — creates HTTP server, attaches Socket.io, connects to MongoDB, starts listening.

**Routes → Controllers** (`backend/routes/` → `backend/controllers/`):
- `auth` — register, login, logout, email verification, password reset
- `board` — collaborative trip planning boards (called "dashboards")
- `community` — posts, likes, comments, saves, friend system
- `chat` — conversations and messages
- `packing` — smart packing lists with AI generation
- `climatiq` — carbon footprint calculations
- `trip` — trip CRUD
- `weather`, `upload` — external API proxy and media uploads

**Models** (`backend/models/`): `user`, `trip`, `post`, `dashboard`, `conversation`, `message`, `notification`, `packing`, `packing-template`, `packing-history`

**Services** (`backend/services/`):
- `gemini.service.js` — Google Gemini AI for generating packing suggestions
- `climatiq.service.js` — Climatiq API for carbon footprint data
- `cloud.service.js` — Cloudinary image/audio uploads via Multer
- `email.service.js` — Resend transactional email with React Email templates (`backend/emails/`)
- `socket.service.js` — Socket.io event handlers (real-time chat, notifications, presence)
- `packing.service.js` — Packing list business logic

**Middleware** (`backend/middleware/`): JWT auth (`auth.middleware.js`), error handling, Multer upload config.

### Auth Flow
JWT tokens are issued on login/register. The web app stores tokens in `localStorage`; the mobile app stores them in `AsyncStorage`. Both use `authFetch()` wrappers that inject the token as a `Bearer` header. The backend validates tokens in `auth.middleware.js`.

### Real-time
Socket.io is used for live chat and notifications. The backend's `socket.service.js` maps socket connections to user IDs. Both frontends use socket client singletons initialized after login.
