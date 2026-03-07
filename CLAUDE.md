# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dayla** is a nature & exploration planning app with a React/TypeScript frontend and a Node.js/Express backend. Two separate npm projects share one git repo.

## Commands

### Frontend (root directory)
```bash
npm run dev      # Start Vite dev server on port 3000
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend (`backend/` directory)
```bash
cd backend
npm run dev      # Start with nodemon (hot reload)
npm start        # Start without hot reload
npm test         # Run Jest tests
node scripts/seed.js        # Seed the database
node scripts/check-setup.js # Verify environment setup
```

### Running both together
Start the backend first, then the frontend. The Vite dev server proxies `/api` and `/socket.io` requests to the backend at `http://localhost:3005`.

## Environment Variables

**Frontend** (`.env.local` in root):
- `GEMINI_API_KEY` — Google Gemini API key (also exposed as `VITE_API_KEY`)
- `VITE_API_URL` — Backend URL (empty in dev; Vite proxy handles it automatically)
- `RESEND_API_KEY`, `EMAIL_FROM` — Email sending

**Backend** (`backend/.env`):
- `MONGO_URI` — MongoDB connection string (required)
- `JWT_SECRET` — Min 32 chars (required)
- `PORT` — Backend port; must match Vite proxy target (set to `3005` for dev)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Media uploads
- `GOOGLE_AI_API_KEY` — Gemini AI for smart packing and suggestions
- `RESEND_API_KEY`, `EMAIL_FROM` — Transactional email via Resend
- `FRONTEND_URL` — For CORS and Socket.io allowed origins
- `WEATHER_API_KEY`, `MAPS_API_KEY` — Optional external APIs

## Architecture

### Frontend

State-based routing (no React Router). `App.tsx` holds global state and renders one of: `auth | dashboard | community | chat | profile` views. URL params are parsed manually for email verification (`?token=`) and board invitations (`?invitationId=`).

**Key files:**
- `App.tsx` — Root component; manages auth state, Socket.io initialization, friend requests, and the notification panel
- `types.ts` — All shared TypeScript types (User, Trip, StickyNote, PackingList, Post, Message, Conversation, etc.)
- `lib/api.ts` — `authFetch()` wrapper that injects the JWT from localStorage; `API_BASE_URL` resolves from `VITE_API_URL` env var
- `lib/socket.ts` — Socket.io client singleton with helpers for joining/leaving rooms and sending messages

**Components** (`components/`): `Dashboard`, `Community`, `ChatView`, `ProfileView`, `AuthView`, `Onboarding`, `VerifyEmail`, `AcceptInvitation`, `Navigation`, `SmartPacking`, `ClimatiqStatus`, `JoinGroup`

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
JWT tokens are issued on login/register and stored in the browser's localStorage. `authFetch()` on the frontend reads the token and sends it as a `Bearer` header. The backend validates it in `auth.middleware.js`. Email verification and board invitations use one-time tokens passed as URL query params.

### Real-time
Socket.io is used for live chat and notifications. The backend's `socket.service.js` maps socket connections to user IDs. The frontend's `lib/socket.ts` singleton is initialized in `App.tsx` after login and exposes typed helpers used by `ChatView` and the notification system.
