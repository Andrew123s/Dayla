# Dayla

**Adventure Planning & Community Platform**

A full-stack web application for outdoor enthusiasts to plan trips, share experiences, connect with friends, and pack smart. Built with React, Node.js, MongoDB, and Socket.io.

---

## Table of Contents

- [Overview](#1-overview)
- [Core Features](#2-core-features)
- [Technology Stack](#3-technology-stack)
- [Folder Structure](#4-folder-structure)
- [API Documentation](#5-api-documentation)
- [Real-Time System](#6-real-time-system)
- [Database Schema](#7-database-schema)
- [UX Flow Descriptions](#8-ux-flow-descriptions)
- [Permissions & Roles](#9-permissions--roles)
- [Setup Instructions](#10-setup-instructions)
- [Known Issues & Future Improvements](#11-known-issues--future-improvements)
- [License](#12-license)

---

## 1. Overview

### What the app is

Dayla is an all-in-one adventure planning and community platform. It combines:

- **Plan Dashboard** — A visual canvas for trip planning with sticky notes, images, voice memos, calendar, and budget tracking
- **Explore (Community)** — Social feed with posts, likes, comments, reposts, and media uploads
- **Chat** — 1-to-1 and group messaging with real-time delivery
- **Friends System** — Search users, send friend requests, and tap-to-chat with friends
- **Ntelipak** — AI-powered Smart Packing Assistant with items, luggage, templates, and smart list generation
- **Profile** — Edit profile, interests, bio, and view stats (trips, posts, friends)
- **Notifications** — Likes, comments, friend requests, board invites, and more

### Who it is for

- Outdoor enthusiasts and travelers
- Adventure planners who want visual, collaborative trip planning
- Users who want to share experiences and connect with like-minded people
- Anyone who needs smart packing suggestions based on destination, weather, and activities

### What problems it solves

- **Scattered planning** — Centralizes trip planning (notes, budget, dates) in one canvas
- **Isolated experiences** — Community feed and friends system enable sharing and discovery
- **Overpacking / underpacking** — Ntelipak generates context-aware packing lists
- **Async collaboration** — Real-time sticky notes and active user tracking for co-planning
- **Notification overload** — Unified notification center with actionable items

### High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vite + React 19)                 │
│  App.tsx → Dashboard | Community | ChatView | ProfileView | ...  │
│  State: useState/useCallback | Auth: JWT + localStorage          │
└───────────────────────────────┬─────────────────────────────────┘
                                │ REST API + Socket.io
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                   │
│  Routes: /api/auth | /api/trips | /api/chat | /api/community     │
│  /api/boards | /api/packing | /api/upload | /api/weather          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
         ┌──────────┐    ┌──────────┐    ┌──────────┐
         │ MongoDB  │    │Cloudinary│    │ Socket.io│
         │ (Mongoose)│   │ (Images) │    │ (Real-time)│
         └──────────┘    └──────────┘    └──────────┘
```

---

## 2. Core Features

### Plan Dashboard

- **Canvas** — Infinite canvas with sticky notes, drag-and-drop, grid snapping
- **Sticky notes** — Text, image, voice, weather, schedule, budget, sustainability types
- **Images & voice notes** — Upload and attach to notes
- **Calendar** — Trip dates with start/end
- **Budget** — Track accommodation, transport, food, activities
- **Real-time collaboration** — See active users, CRUD permissions for collaborators
- **Invitations** — Invite users by email; they accept to join the plan

### Explore (Community)

- **Posts** — Create posts with content, location, images
- **Likes** — Like/unlike posts; notifications to post owner
- **Comments** — Add comments in dedicated modal; long-press to delete (owner only)
- **Reposts** — Repost with attribution to original author
- **3-dot menu** — Delete (owner), Edit (owner), Repost (all)
- **Media uploads** — Images via Cloudinary; no auto-crop/resize

### Chat

- **1-to-1 messaging** — Direct conversations with friends
- **Group chats** — Create groups, add members, edit profile, share invite links
- **Real-time** — Socket.io for instant message delivery and typing indicators
- **File attachments** — Upload documents/images

### Friends System

- **Find Friends** — Search by name/email; live results as you type
- **Add Friend** — Send request; recipient sees in notifications
- **Pending state** — "Pending" badge when request sent; "Accept" when received
- **Tap-to-chat** — Tap friend → opens chat instantly
- **Already-added** — Friends appear at top with "Tap to chat" hint

### Notifications

- **Types** — Like, comment, friend_request, friend_accepted, board_join
- **Real-time** — Socket event `notification:new` triggers refetch
- **Clickable** — Like/comment → Community; friend → Chat; board_join → Dashboard
- **Mark as read** — On open; badge count updates

### Profile

- **Edit profile** — Name, bio, interests (comma-separated)
- **Avatar** — Upload via Cloudinary
- **Stats** — Trips, posts, friends counts
- **My interests** — Display tags
- **My visited places** — From completed trips
- **Settings** — Notifications toggle, dark mode (coming soon)

### Ntelipak Smart Packing Assistant

- **Items** — Add manually; categories (clothing, toiletries, electronics, etc.)
- **Luggage** — Add bags (carry-on, checked, backpack, etc.) with max weight
- **Templates** — System/user templates; apply to list
- **Smart List** — AI-generated list from destination, activities, duration, weather
- **Suggestions** — Compliance and duplicate checks

### Authentication

- **Register** — Email, password, name; email verification
- **Login** — JWT in cookie + localStorage
- **Sessions** — `protect` middleware on protected routes
- **Onboarding** — Multi-step intro; skippable

### Real-time Collaboration

- **Active users** — Join/leave dashboard; count shown on Plan
- **Sticky note CRUD** — Collaborators have full permissions
- **Socket rooms** — Dashboard and conversation rooms

---

## 3. Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite 6** | Build tool, dev server |
| **TypeScript** | Type safety |
| **Lucide React** | Icons |
| **Socket.io Client** | Real-time events |
| **No state library** | useState, useCallback, useEffect |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express** | API framework |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **JWT** | Auth tokens |
| **Joi** | Validation |
| **Winston** | Logging |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting |

### Real-time

| Technology | Purpose |
|------------|---------|
| **Socket.io** | WebSockets |
| **JWT in handshake** | Socket auth |

### Storage

| Service | Purpose |
|---------|---------|
| **Cloudinary** | Images, documents, audio |
| **MongoDB** | All app data |

### Deployment

- **Frontend** — Static build; deployable to Vercel, Netlify, or any static host
- **Backend** — Node server; deployable to Render, Railway, Heroku, etc.
- **Database** — MongoDB Atlas (or self-hosted)
- **PWA** — Service worker for offline-first

---

## 4. Folder Structure

```
daylalpp/
├── components/           # React components
│   ├── App.tsx           # Root app, routing, notifications
│   ├── AuthView.tsx      # Login, register
│   ├── Dashboard.tsx     # Plan Dashboard (canvas, notes, Ntelipak)
│   ├── Community.tsx     # Explore feed, posts, comments
│   ├── ChatView.tsx      # Chat, Find Friends
│   ├── ProfileView.tsx   # Profile, settings
│   ├── SmartPacking.tsx  # Ntelipak modal
│   ├── Onboarding.tsx    # Onboarding flow
│   ├── Navigation.tsx    # Bottom nav
│   ├── VerifyEmail.tsx   # Email verification
│   ├── AcceptInvitation.tsx
│   └── ...
├── lib/
│   ├── api.ts            # authFetch, token helpers
│   └── socket.ts         # Socket.io client, join/leave, sendMessage
├── types.ts              # TypeScript interfaces
├── index.tsx             # Entry point, PWA registration
├── index.html
├── vite.config.ts
├── package.json
│
└── backend/
    ├── config/
    │   ├── db.config.js      # MongoDB connection
    │   ├── env.config.js     # Env validation
    │   └── socket.config.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── trip.controller.js
    │   ├── board.controller.js
    │   ├── chat.controller.js
    │   ├── community.controller.js
    │   ├── packing.controller.js
    │   └── ...
    ├── middleware/
    │   ├── auth.middleware.js    # protect, optionalAuth
    │   ├── upload.middleware.js   # Multer
    │   └── error.middleware.js
    ├── models/
    │   ├── user.model.js
    │   ├── trip.model.js
    │   ├── dashboard.model.js
    │   ├── post.model.js
    │   ├── conversation.model.js
    │   ├── message.model.js
    │   ├── notification.model.js
    │   ├── packing.model.js
    │   ├── packing-template.model.js
    │   └── packing-history.model.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── trip.routes.js
    │   ├── board.routes.js
    │   ├── chat.routes.js
    │   ├── community.routes.js
    │   ├── packing.routes.js
    │   ├── upload.routes.js
    │   ├── weather.routes.js
    │   └── climatiq.routes.js
    ├── services/
    │   ├── socket.service.js
    │   ├── packing.service.js
    │   ├── gemini.service.js
    │   ├── email.service.js
    │   └── cloud.service.js
    ├── utils/
    │   ├── validator.js
    │   └── logger.js
    ├── app.js
    ├── server.js
    └── package.json
```

---

## 5. API Documentation

### Auth Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register user |
| POST | `/login` | Login |
| POST | `/verify-email` | Verify email with token |
| POST | `/resend-verification` | Resend verification email |
| GET | `/check` | Check auth status (protected) |
| POST | `/logout` | Logout (protected) |
| GET | `/me` | Get current user (protected) |
| PUT | `/me` | Update profile (protected) |
| GET | `/search?q=query` | Search users (protected) |
| GET | `/friends` | Get friends list (protected) |
| GET | `/friend-requests/pending` | Get pending requests (protected) |
| POST | `/friend-request/:userId` | Send friend request (protected) |
| POST | `/friend-request/:userId/accept` | Accept request (protected) |
| POST | `/friend-request/:userId/decline` | Decline request (protected) |
| GET | `/notifications` | Get notifications (protected) |
| POST | `/notifications/read` | Mark as read (protected) |
| POST | `/complete-onboarding` | Complete onboarding (protected) |
| POST | `/upload-avatar` | Upload avatar (protected) |

**Example: Login**

```json
// Request
POST /api/auth/login
{ "email": "user@example.com", "password": "secret123" }

// Response
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "avatar": "..." },
    "token": "eyJhbGc..."
  }
}
```

### Community Routes (`/api/community`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | Get feed |
| POST | `/posts` | Create post |
| GET | `/posts/:id` | Get single post |
| PUT | `/posts/:id` | Update post |
| DELETE | `/posts/:id` | Delete post |
| POST | `/posts/:id/likes` | Like post |
| DELETE | `/posts/:id/likes` | Unlike post |
| POST | `/posts/:id/comments` | Add comment |
| PUT | `/posts/:postId/comments/:commentId` | Update comment |
| DELETE | `/posts/:postId/comments/:commentId` | Delete comment |
| POST | `/posts/:id/save` | Save/unsave post |
| GET | `/saved` | Get saved posts |

**Example: Add Comment**

```json
// Request
POST /api/community/posts/:id/comments
{ "content": "Great shot!" }

// Response
{
  "success": true,
  "data": {
    "comment": { "id": "...", "author": {...}, "content": "Great shot!", "createdAt": "..." },
    "commentCount": 3
  }
}
```

### Chat Routes (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | List conversations |
| POST | `/conversations` | Create conversation |
| GET | `/conversations/:id` | Get conversation |
| PUT | `/conversations/:id` | Update (e.g. group name) |
| DELETE | `/conversations/:id` | Delete conversation |
| GET | `/conversations/:id/messages` | Get messages (paginated) |
| POST | `/conversations/:id/messages` | Send message |
| POST | `/conversations/:id/members` | Add members |
| POST | `/conversations/:id/invite-link` | Generate invite link |
| POST | `/join/:inviteCode` | Join via invite code |

### Trip & Board Routes (`/api/trips`, `/api/boards`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | Get user trips |
| POST | `/api/trips` | Create trip (+ dashboard) |
| GET | `/api/trips/:id` | Get trip |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |
| POST | `/api/trips/:id/notes` | Create sticky note |
| PUT | `/api/trips/:id/notes/:noteId` | Update note |
| DELETE | `/api/trips/:id/notes/:noteId` | Delete note |
| GET | `/api/boards/:boardId` | Get dashboard |
| GET | `/api/boards/:boardId/active-users` | Get active users |
| POST | `/api/boards/:boardId/join` | Join dashboard |
| POST | `/api/boards/:boardId/leave` | Leave dashboard |
| POST | `/api/boards/:boardId/invite` | Invite user |
| POST | `/api/boards/invitations/:id/accept` | Accept invite |
| POST | `/api/boards/invitations/:id/decline` | Decline invite |

### Ntelipak Routes (`/api/packing`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/memory` | Get packing memory |
| GET | `/templates` | Get templates |
| GET | `/:tripId` | Get packing list |
| POST | `/:tripId/generate` | Generate smart list |
| POST | `/:tripId/items` | Add item |
| PUT | `/:tripId/items/:itemId` | Update item |
| DELETE | `/:tripId/items/:itemId` | Remove item |
| POST | `/:tripId/luggage` | Add luggage |
| DELETE | `/:tripId/luggage/:luggageId` | Remove luggage |
| GET | `/:tripId/suggestions` | Get suggestions |
| POST | `/:tripId/apply-template` | Apply template |
| POST | `/:tripId/report` | Report usage |

**Example: Generate Smart List**

```json
// Request
POST /api/packing/:tripId/generate
{
  "activities": ["hiking", "camping"],
  "airline": "United",
  "countryCode": "US",
  "destination": "Yosemite"
}

// Response
{
  "success": true,
  "data": { /* PackingList with generated items */ }
}
```

---

## 6. Real-Time System

### How events are emitted

- **HTTP controllers** use `req.app.get('io')` to emit events after DB writes
- **Socket service** handles `join_room`, `leave_room`, `send_message`, `typing_start`, etc.

### Events emitted by backend

| Event | When | Payload |
|-------|------|---------|
| `notification:new` | Like, comment, friend request, friend accepted, board join | `{ recipientId, type, senderName, postId?, timestamp }` |
| `friend:request_sent` | Friend request sent | `{ fromUser, toUserId }` |
| `friend:request_accepted` | Friend request accepted | `{ acceptedBy, requestFrom }` |
| `post:liked` | Post liked | `{ postId, likeCount }` |
| `comment:added` | Comment added | `{ postId, comment, commentCount }` |
| `comment:deleted` | Comment deleted | `{ postId, commentId, commentCount }` |
| `user_joined` | User joined dashboard room | `{ userId, name, avatar }` |
| `user_left` | User left dashboard room | `{ userId }` |
| `new_message` | Chat message sent | `{ conversationId, ...message }` |
| `user_typing` | User typing in chat | `{ conversationId, userName }` |
| `user_stopped_typing` | User stopped typing | `{ conversationId, userName }` |

### How the frontend listens

- **App.tsx** — `notification:new`, `friend:request_sent`, `friend:request_accepted` → refetch notifications/friend requests
- **Community.tsx** — `post:liked`, `comment:added`, `comment:deleted` → update posts state
- **ChatView.tsx** — `new_message`, `user_typing`, `user_stopped_typing` → update messages/typing
- **Dashboard.tsx** — `user_joined` → refresh collaborators

### Notification flow

1. User A likes User B's post
2. Backend creates `Notification` document, emits `notification:new` with `recipientId: B`
3. User B's client receives event, calls `fetchNotifications()`
4. Badge count updates; notifications appear in panel

### Active user tracking

1. User opens Plan Dashboard → `join_room` with `roomType: 'dashboard'`
2. Backend adds user to `dashboard.activeUsers`, emits `user_joined` to room
3. Other clients in room update active users list
4. On leave → `leave_room` → `removeActiveUser` → `user_left`

### Chat message delivery

1. Client emits `send_message` with `{ conversationId, content }`
2. Socket service creates Message in DB, emits `new_message` to conversation room
3. All participants in room receive message instantly

---

## 7. Database Schema

### Users

| Field | Type | Description |
|-------|------|-------------|
| name | String | Required |
| email | String | Unique |
| password | String | Hashed (bcrypt) |
| avatar | String | URL |
| bio | String | |
| interests | [String] | |
| friends | [ObjectId] | ref User |
| friendRequests | [{ from, status, createdAt }] | pending/accepted/declined |
| isActive | Boolean | |
| emailVerified | Boolean | |
| verificationToken | String | |

### Trips

| Field | Type | Description |
|-------|------|-------------|
| name | String | |
| description | String | |
| owner | ObjectId | ref User |
| collaborators | [ObjectId] | ref User |
| destination | { name, coordinates, country } | |
| dates | { startDate, endDate } | |
| budget | { total, currency, categories } | |
| status | String | planning, booked, in_progress, completed, cancelled |
| category | String | hiking, beach, etc. |

### Dashboards (Plans)

| Field | Type | Description |
|-------|------|-------------|
| tripId | ObjectId | ref Trip |
| owner | ObjectId | ref User |
| collaborators | [{ user, role, joinedAt }] | editor, admin |
| notes | [stickyNoteSchema] | Embedded |
| activeUsers | [{ userId, name, avatar, currentNote }] | |
| invitations | [{ id, email, status, expiresAt }] | |

### Sticky Notes (embedded in Dashboard)

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique |
| type | String | text, image, voice, weather, schedule, budget, sustainability |
| x, y, width, height | Number | Position/size |
| content | String | |
| color | String | |
| audioUrl | String | |
| createdBy, lastEditedBy | Mixed | |

### Posts

| Field | Type | Description |
|-------|------|-------------|
| author | ObjectId | ref User |
| content | String | |
| images | [{ url, caption }] | |
| location | { name, coordinates } | |
| likes | [{ user, createdAt }] | |
| comments | [commentSchema] | Embedded |
| repostedFrom | { post, author, authorName } | |

### Comments (embedded in Post)

| Field | Type | Description |
|-------|------|-------------|
| id | String | |
| author | ObjectId | ref User |
| content | String | |
| createdAt | Date | |

### Notifications

| Field | Type | Description |
|-------|------|-------------|
| recipient | ObjectId | ref User |
| sender | ObjectId | ref User |
| type | String | like, comment, friend_request, friend_accepted, board_join |
| post | ObjectId | ref Post (optional) |
| dashboard | ObjectId | ref Dashboard (optional) |
| message | String | |
| read | Boolean | |

### Conversations

| Field | Type | Description |
|-------|------|-------------|
| name | String | |
| isGroup | Boolean | |
| participants | [{ user, role, joinedAt, lastReadAt }] | |
| createdBy | ObjectId | ref User |
| lastMessage | ObjectId | ref Message |
| inviteCode | String | |

### Messages

| Field | Type | Description |
|-------|------|-------------|
| conversation | ObjectId | ref Conversation |
| sender | ObjectId | ref User |
| content | String | |
| messageType | String | text, image, etc. |
| attachments | [Object] | |

### PackingList

| Field | Type | Description |
|-------|------|-------------|
| tripId | ObjectId | ref Trip |
| owner | ObjectId | ref User |
| collaborators | [{ user, role }] | |
| items | [packingItemSchema] | |
| luggage | [luggageSchema] | |
| generatedFrom | Object | Metadata |

### PackingTemplate

| Field | Type | Description |
|-------|------|-------------|
| name | String | |
| type | String | system, user, seasonal, destination |
| tripCategory | String | |
| items | [{ name, category, quantity }] | |

### Relationships

```
User ──┬── friends ──► User
       ├── friendRequests ──► User
       └── (author of) ──► Post, Message, Notification

Trip ──┬──► Dashboard (1:1)
       └──► PackingList (1:1)

Dashboard ──► notes[] (embedded StickyNote)
           ──► collaborators[] ──► User

Post ──► comments[] (embedded)
      ──► likes[] ──► User

Conversation ──► participants[] ──► User
             ──► Message[]

Notification ──► recipient, sender ──► User
             ──► post (optional) ──► Post
             ──► dashboard (optional) ──► Dashboard
```

---

## 8. UX Flow Descriptions

### How a user creates a plan

1. User opens Plan Dashboard
2. If no trip exists, app creates one via `POST /api/trips` (name, dates)
3. Backend creates Trip + Dashboard; returns both IDs
4. Frontend stores `dashboardId`, `tripId` in state and localStorage
5. User adds sticky notes (text, image, voice) via canvas
6. Notes are persisted via `POST /api/trips/:id/notes`
7. User can invite collaborators via email; they receive link and accept

### How a user posts in Explore

1. User taps + button → Post modal opens
2. Enters content, location (required), optional title and image
3. Image uploads to Cloudinary first; URL added to post payload
4. `POST /api/community/posts` with `{ content, location, images? }`
5. Post appears in feed; socket `post:created` triggers refresh for others

### How comments work (inside modal)

1. User taps comment icon on post → Comment modal opens
2. Comments load from `post.comments` (no separate fetch)
3. User types and taps Send → `POST /api/community/posts/:id/comments`
4. Optimistic update; on success, comment replaced with server data
5. `comment:added` socket event updates other clients
6. Long-press on own comment → Delete option → `DELETE /api/community/posts/:postId/comments/:commentId`

### How friend search works (real-time filtering)

1. User taps "Find Friends" in Chat → Modal opens
2. Fetches friends via `GET /api/auth/friends`
3. As user types (debounced 300ms), `GET /api/auth/search?q=...` is called
4. Results include: matching users with `friendStatus` (friend, pending_sent, pending_received, none)
5. Friends shown at top with "Tap to chat"; others show Add / Pending / Accept
6. Add → `POST /api/auth/friend-request/:userId`; Accept → `POST /api/auth/friend-request/:userId/accept`

### How notifications appear

1. On app load and tab focus: `fetchNotifications()` + `fetchPendingFriendRequests()`
2. Socket `notification:new` and `friend:request_sent` trigger refetch
3. Badge = `pendingFriendRequests.length + unreadNotifCount`
4. Tapping bell opens panel; `POST /api/auth/notifications/read` marks as read
5. Tapping a notification navigates (like/comment → Community, friend → Chat, board_join → Dashboard)

### How Ntelipak generates smart lists

1. User opens Ntelipak from Plan Dashboard (requires `tripId`)
2. Taps "Smart List" → Form: activities, destination, airline, country
3. `POST /api/packing/:tripId/generate` with body
4. Backend fetches trip (destination, dates, category), optionally weather
5. `packing.service.js` uses Google Gemini to generate items
6. Items added to PackingList; response returned
7. UI updates with new items

---

## 9. Permissions & Roles

| Action | Who can do it |
|--------|----------------|
| Edit sticky notes | Owner + collaborators (editor/admin) |
| Delete sticky notes | Owner + collaborators |
| Delete post | Post owner only |
| Edit post | Post owner only |
| Repost | Any authenticated user |
| Delete comment | Comment author only (long-press) |
| Edit plan (trip) | Owner + collaborators |
| Add items in Ntelipak | Owner + collaborators (editor) |
| Invite to board | Owner + admin collaborators |
| Accept/decline invite | Invited user (by email) |

---

## 10. Setup Instructions

### Prerequisites

- Node.js >= 16
- MongoDB (local or Atlas)
- npm or yarn

### Clone the repo

```bash
git clone https://github.com/Andrew123s/Dayla.git
cd Dayla
```

### Install dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### Environment variables

**Frontend** (optional; defaults work with proxy):

```env
VITE_API_URL=http://localhost:5000
```

**Backend** (`backend/.env`):

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/dayla

JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Email (Resend or Nodemailer)
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@yourdomain.com

# Optional: Weather, Gemini, Climatiq
WEATHER_API_KEY=xxx
GOOGLE_AI_API_KEY=xxx
CLIMATIQ_API_KEY=xxx
```

### Run locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

- Frontend: http://localhost:3000 (or 5173)
- Backend: http://localhost:5000
- Vite proxy forwards `/api` and `/socket.io` to backend (see `vite.config.ts`)

### Deploy

- **Frontend**: `npm run build` → deploy `dist/` to Vercel, Netlify, etc. Set `VITE_API_URL` to production API URL.
- **Backend**: Deploy to Render, Railway, Heroku. Set `FRONTEND_URL` for CORS. Use MongoDB Atlas for `MONGO_URI`.

---

## 11. Known Issues & Future Improvements

### Known issues

- Dark mode toggle is disabled (coming soon)
- Share button on posts is placeholder
- Push notifications not implemented (in-app only)
- Some legacy `document.save()` patterns were refactored to atomic updates; edge cases may remain

### Future improvements

- Push notifications (web push)
- Offline support for packing list
- Trip sharing (public links)
- Carbon footprint tracking (Climatiq integration)
- Mobile app (React Native)

---

## 12. License

MIT License. See [LICENSE](LICENSE) for details.

---

**Built with ❤️ for adventure seekers and nature lovers.**
