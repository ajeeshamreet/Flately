# Flately Complete Implementation Handoff

Last updated: 2026-04-06
Audience: New engineers onboarding to this codebase

## 1. Purpose

This document is a full implementation handoff for the current Flately system state.
If you hand this repository and this document to a developer, they should be able to run the project, understand all active contracts, and verify all critical user flows.

## 2. Product Contract (Current)

1. Authentication supports email/password and Google OAuth.
- Supported endpoints:
  - `POST /auth/signup`, `POST /auth/login`
  - `GET /auth/google/start`, `GET /auth/google/callback`, `GET /auth/google/exchange`
- Session payload contains `accessToken` + `user`.

2. Protected routes require an authenticated session.
- Frontend route guard: `frontend/src/app/ProtectedRoute.tsx`.
- Unauthorized users are redirected to `/login`.

3. Discovery and matches are onboarding-gated.
- User must have:
  - profile record,
  - preferences record,
  - `profile.onboardingCompleted === true`.
- Before completion, these backend routes return `403`:
  - `GET /matching/me`
  - `GET /discovery` and `GET /discovery/feed`
  - `POST /discovery/swipe`
  - `GET /matches/me`
  - `POST /matches/connect/:toUserId`

4. Data safety contract.
- `GET /users/me` returns sanitized payload only.
- `passwordHash` must never be returned to frontend.

## 3. Architecture Map

## 3.1 Frontend

Root: `frontend/`

Core modules:
- Routing: `frontend/src/app/router.tsx`
- Route guard: `frontend/src/app/ProtectedRoute.tsx`
- App shell: `frontend/src/app/AppLayout.tsx`
- Auth state/provider:
  - `frontend/src/features/auth/AuthProvider.tsx`
  - `frontend/src/features/auth/AuthBootstrap.tsx`
  - `frontend/src/features/auth/authSlice.ts`
  - `frontend/src/features/auth/auth.storage.ts`
- Transport core:
  - `frontend/src/services/api.ts` (Fetch Adapter + Strategy, token injection, one-shot 401 handler)
- Onboarding:
  - `frontend/src/features/onboarding/OnboardingPage.tsx`
  - `frontend/src/features/onboarding/onboarding.mapper.ts`
- Pre-auth questionnaire:
  - `frontend/src/features/preauth/PreAuthQuestionnairePage.tsx`
  - `frontend/src/features/preauth/preauth.storage.ts`
- Main feature pages:
  - `frontend/src/features/dashboard/DashboardPage.tsx`
  - `frontend/src/features/discovery/DiscoveryPage.tsx`
  - `frontend/src/features/matches/MatchesPage.tsx`
  - `frontend/src/features/chat/ChatPage.tsx`
  - `frontend/src/features/profile/ProfileEditorPage.tsx`

Runtime config:
- `frontend/src/config/runtimeConfig.ts`
- default API/socket base URL: `http://localhost:4000`.

## 3.2 Backend

Root: `backend/`

Server setup:
- `backend/src/server.ts`
- `backend/src/app.ts`

Auth and identity:
- `backend/src/modules/auth/auth.routes.ts`
- `backend/src/modules/auth/auth.controller.ts`
- `backend/src/modules/auth/auth.service.ts`
- JWT middleware: `backend/src/middlewares/jwt.middleware.ts`

User/profile/preferences:
- `backend/src/modules/users.routes.ts`
- `backend/src/modules/users.controllers.ts`
- `backend/src/modules/users.service.ts`
- `backend/src/modules/profiles/*`
- `backend/src/modules/preferences/*`

Matching/discovery/matches:
- `backend/src/modules/matching/matching.service.ts`
- `backend/src/modules/matching/matching.routes.ts`
- `backend/src/modules/discovery/discovery.service.ts`
- `backend/src/modules/discovery/discovery.routes.ts`
- `backend/src/modules/matches/matches.service.ts`
- `backend/src/modules/matches/matches.routes.ts`

Database schema:
- `backend/prisma/schema.prisma`

## 4. Environment Setup

## 4.1 Backend `.env`

Required values:
- `PORT` (default `4000`)
- `DATABASE_URL` (MongoDB)
- `JWT_ACCESS_SECRET` (min length 16)
- `JWT_ACCESS_EXPIRES_IN` (default `1h`)
- `FRONTEND_URL` (default `http://localhost:5174`)
- `GOOGLE_OAUTH_CLIENT_ID` (required for Google login)
- `GOOGLE_OAUTH_CLIENT_SECRET` (required for Google login)
- `GOOGLE_OAUTH_CALLBACK_URL` (default `http://localhost:4000/auth/google/callback`)

Validation source: `backend/src/config/env.ts`

## 4.2 Frontend `.env` (optional)

Optional values:
- `VITE_API_BASE_URL` (default `http://localhost:4000`)
- `VITE_SOCKET_URL` (default `http://localhost:4000`)
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

Source: `frontend/src/config/runtimeConfig.ts`

## 5. Runbook

1. Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Start backend:
```bash
cd backend
npm run dev
```

3. Start frontend:
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5174
```

4. Open app:
- Frontend: `http://localhost:5174`
- Backend health: `http://localhost:4000/health`

## 6. Full Flow Definition

1. Landing (`/`)
- User can go to `/start`, `/login`, or `/signup`.

2. Questionnaire (`/start`)
- Captures baseline values in session storage.
- Data is schema-sanitized before onboarding prefill.

3. Signup/Login (`/signup`, `/login`)
- Email/password or Google OAuth both resolve to the same session shape.
- Successful auth stores session (`accessToken`) in local storage.

4. OAuth callback (`/auth/callback`)
- Frontend exchanges one-time code (`/auth/google/exchange`) and persists session.

5. Auth bootstrap
- Frontend fetches profile via `GET /users/me` then profile data via profile transport.

6. Onboarding (`/app/onboarding`)
- Saves profile via `POST /profiles/me`.
- Saves preferences via `POST /preferences/me`.
- Sets onboarding complete.

7. Post-onboarding features
- Dashboard (`/app`)
- Discovery (`/app/discover`)
- Matches (`/app/matches`)
- Chat (`/app/chat/:matchId?`)
- Profile editor (`/app/profile`)

## 7. Verification Commands (Current)

Backend:
```bash
cd backend
npm run test
npm run typecheck
npm run build
```

Frontend:
```bash
cd frontend
npm run test
npm run typecheck
npm run lint
npm run build
```

## 8. Verification Results (2026-04-05)

1. Backend unit tests: pass (`29/29`).
2. Backend typecheck: pass.
3. Backend build: pass.
4. Frontend unit tests: pass (`10/10`).
5. Frontend typecheck: pass.
6. Frontend lint: pass.
7. Frontend build: pass.

## 9. Runtime Contract Checks (2026-04-05)

Direct API probes with fresh user sessions:

1. Before onboarding completion:
- `GET /discovery/feed` -> `403 {"message":"Onboarding completion is required"}`
- `GET /matches/me` -> `403 {"message":"Onboarding completion is required"}`
- `POST /discovery/swipe` -> `403 {"message":"Onboarding completion is required"}`

2. After onboarding completion:
- `GET /discovery/feed` -> `200` + candidate array
- `GET /matches/me` -> `200` + match array (possibly empty)

3. User safety:
- `GET /users/me` returns sanitized payload with safe fields only.

## 10. Browser Flow Checks (2026-04-05)

1. New user signup redirects to onboarding.
2. Direct navigation to `/app/discover` before completion redirects back to `/app/onboarding`.
3. After completing all onboarding steps, user lands on dashboard and can open discovery.

## 11. Known Non-Blocking Item

- React Router future-flag warning appears in dev console. No functional impact on current flow.

## 12. Source-of-Truth Documents

- Product flow: `docs/product-user-flow.md`
- Frontend implementation: `docs/frontend-guide.md`
- API contract: `docs/api-reference.md`
- Runtime verification evidence: `docs/manual-auth-end-to-end-verification.md`
- E2E flow and flaw backlog: `README.md`
- Rebuild status log: `docs/frontend-rebuild-status-2026-04-05.md`
