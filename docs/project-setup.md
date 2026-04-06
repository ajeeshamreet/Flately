# Flately — Project Setup & Development Guide

> Quick-start guide to set up the full-stack Flately project from scratch.
> Last updated: 2026-04-06

---

## Prerequisites

- **Node.js** ≥ 18 (recommended 22.x)
- **npm** ≥ 9
- **MongoDB Atlas** account (or a local MongoDB instance)
- Backend JWT secret for local development
- Google OAuth credentials for end-to-end Google sign-in testing
- Cloudinary account (cloud name + API key + API secret)

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url> flately-full_stack
cd flately-full_stack

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 2. Backend Configuration

Create `backend/.env`:

```env
PORT=4000
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/flately"
JWT_ACCESS_SECRET="<min-16-char-secret>"
JWT_ACCESS_EXPIRES_IN="1h"
FRONTEND_URL="http://localhost:5174"
GOOGLE_OAUTH_CLIENT_ID="<google-client-id>"
GOOGLE_OAUTH_CLIENT_SECRET="<google-client-secret>"
GOOGLE_OAUTH_CALLBACK_URL="http://localhost:4000/auth/google/callback"
CLOUDINARY_CLOUD_NAME="<cloudinary-cloud-name>"
CLOUDINARY_API_KEY="<cloudinary-api-key>"
CLOUDINARY_API_SECRET="<cloudinary-api-secret>"
CLOUDINARY_UPLOAD_FOLDER="flately/profiles"
```

Notes:
- `FRONTEND_URL` should match the frontend origin used for login callbacks.
- If your frontend runs on a different origin (for example `http://localhost:5173`), update `FRONTEND_URL` accordingly.

### Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### Seed Demo Data (Optional)

```bash
npm run seed         # Creates or updates synthetic Indian demo users with matches and conversations
npm run seed:reset   # Reserved reset script (currently passes --reset to same seed flow)
```

Current seed behavior is idempotent upsert of demo records; no destructive reset branch is currently implemented in `prisma/seed.ts`.

---

## 3. Frontend Environment

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_CLOUDINARY_CLOUD_NAME=<cloud-name>
VITE_CLOUDINARY_UPLOAD_PRESET=<upload-preset>
```

Cloudinary upload flow:
- Preferred: signed upload via backend `POST /uploads/signature` using backend Cloudinary secrets.
- Compatibility fallback: unsigned preset upload if signed endpoint is not configured.

Runtime values are loaded from `frontend/src/config/runtimeConfig.ts` and consumed by `main.tsx`, API client, and socket client.

Frontend API transport is manual fetch-based and uses Adapter + Strategy (`HttpClientAdapter` + `FetchRequestStrategy`) in `src/services/api.ts`.

---

## 4. Run the Application

### Terminal 1 — Backend

```bash
cd backend
npm run dev
# Output: Server + Socket running on port 4000
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
# Output: Local URL printed by Vite (commonly http://localhost:5173)
```

### Verify

- **Backend health**: `curl http://localhost:4000/health` → `{ "status": "ok" }`
- **Frontend**: Open the Vite local URL shown in terminal (commonly `http://localhost:5173`)
- **OAuth callback target**: Ensure backend `FRONTEND_URL` matches the frontend origin used during sign-in
- **Cloudinary signature check**: authenticated `POST /uploads/signature` should return signature payload when Cloudinary env is configured

---

## 5. Project Directory Structure

```
flately-full_stack/
├── backend/
│   ├── .env                    # Environment variables
│   ├── package.json            # Backend dependencies
│   ├── tsconfig.json           # TypeScript config
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (7 models)
│   │   ├── seed.ts             # Demo data seeder
│   └── src/
│       ├── app.ts              # Express app setup
│       ├── server.ts           # HTTP + Socket.IO server
│       ├── config/             # Environment + Prisma config
│       ├── middlewares/        # JWT middleware + controller chain
│       ├── modules/            # Feature modules (controller/service/routes)
│       └── types/              # TypeScript interfaces
├── frontend/
│   ├── index.html              # Entry HTML
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.ts          # Vite configuration
│   └── src/
│       ├── main.tsx            # App entry (Redux + AuthProvider + AuthBootstrap + Router)
│       ├── index.css           # Design tokens
│       ├── app/                # Router, store, layout
│       ├── pages/              # Page components
│       ├── features/           # Feature modules
│       ├── services/           # API transports
│       └── types/              # TypeScript interfaces
└── docs/                       # This documentation
```

---

## 6. Available Scripts

### Backend (`cd backend`)

| Script | Command | Purpose |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Dev server with hot reload |
| `start` | `tsx src/server.ts` | Production start (via tsx) |
| `build` | `tsc` | Compile TypeScript to `dist/` |
| `start:prod` | `node dist/server.js` | Run compiled JS |
| `test` | `vitest run` | Run backend test suite once |
| `test:watch` | `vitest` | Run backend tests in watch mode |
| `test:coverage` | `vitest run --coverage` | Run tests with coverage output |
| `seed` | `tsx prisma/seed.ts` | Seed idempotent demo data |
| `seed:reset` | `tsx prisma/seed.ts --reset` | Reserved reset script (currently passes --reset to same seed flow) |
| `typecheck` | `tsc --noEmit` | Type checking only |

### Frontend (`cd frontend`)

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Dev server (port assigned by Vite) |
| `build` | `vite build` | Production build to `dist/` |
| `preview` | `vite preview` | Preview production build |
| `lint` | `eslint .` | Run linter |
| `storybook` | `storybook dev -p 6006` | Component storybook |
| `build-storybook` | `storybook build` | Build storybook static |

---

## 7. Documentation Index

| File | Contents |
|---|---|
| [`architecture.md`](./architecture.md) | System architecture, tech stack, auth flow, module structure, routing map |
| [`database-schema.md`](./database-schema.md) | ER diagram, Prisma schema, relationships, field enums, seed data |
| [`api-reference.md`](./api-reference.md) | All REST + Socket.IO endpoints with request/response examples |
| [`matching-algorithm.md`](./matching-algorithm.md) | Compatibility algorithm deep-dive with formulas and worked examples |
| [`frontend-guide.md`](./frontend-guide.md) | Frontend architecture, design system, page breakdowns, Redux slices |
| [`backend-code-reference.md`](./backend-code-reference.md) | Current backend architecture baseline with compatibility snippets |
| [`minimal-ui-redesign-plan.md`](./minimal-ui-redesign-plan.md) | Forward plan for minimal frontend redesign and verification-first rollout |
| [`project-setup.md`](./project-setup.md) | This file — setup, scripts, directory structure |

---

## 8. Key Architecture Decisions

1. **MongoDB + Prisma** — Chosen for flexible schema and fast prototyping. Prisma provides type-safe queries without native MongoDB driver boilerplate.

2. **JWT auth with dual sign-in modes** — Email/password and Google OAuth both issue the same backend JWT session shape for protected APIs.

3. **Redux Toolkit** — Centralized state management for authenticated user state, discovery feed, matches, and chat conversations across all pages.

4. **Socket.IO** — Enables real-time chat without polling. Messages are persisted to MongoDB and broadcast to all users in the conversation room.

5. **Module Pattern** — Each backend feature is self-contained: `routes.ts` → `controller.ts` → `service.ts`. Controllers handle HTTP I/O, services contain business logic.

6. **TailwindCSS v4** — Uses the new `@theme` directive for design tokens and `@import "tailwindcss"` for setup. Custom tokens defined for the green command-center aesthetic.

7. **Monorepo (simple)** — Backend and frontend are separate npm packages in the same repo, not managed by Turborepo/Nx. Each runs independently.

8. **Manual Fetch Transport (Adapter + Strategy)** — Frontend API calls use native fetch via `HttpClientAdapter` + `FetchRequestStrategy`, while preserving the stable `apiRequest(...)` contract used across transport modules.
