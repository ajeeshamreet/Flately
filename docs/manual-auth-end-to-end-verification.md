# Manual Auth End-to-End Verification Report

Date: 2026-04-05
Scope: Flately frontend + backend runtime verification after manual-auth cutover

## 1. Goal

Verify that the product works end-to-end with email/password authentication only, while keeping profile completion, discovery, matches, and chat routes stable with real backend data.

## 2. Architecture Decisions Applied

1. Authentication mode is manual only:
- Supported: `POST /auth/signup`, `POST /auth/login`.
- Removed from runtime flow: OAuth/Auth0 redirect/callback path usage.

2. Route gating remains strict:
- Public: `/`, `/start`, `/signup`, `/login`.
- Protected: `/app`, `/app/onboarding`, `/app/discover`, `/app/matches`, `/app/chat/:matchId?`, `/app/profile`.

3. Incomplete-profile access is strict:
- Discovery/matches/swipe return `403` with `{"message":"Onboarding completion is required"}` until onboarding is complete.

4. User data exposure is sanitized:
- `/users/me` no longer returns password hash or internal auth storage fields.

## 3. Backend Runtime Checks

## 3.1 Process and mount verification

- Backend process launched from `backend` package directory.
- Confirmed server bound to port `4000`.
- Confirmed active route mounts in app:
  - `/auth`
  - `/users`
  - `/profiles`
  - `/preferences`
  - `/discovery`
  - `/matches`
  - `/chat`

## 3.2 Fresh-user API smoke test

Used a fresh user account to avoid cache/index side effects.

1. `POST /auth/signup`
- Status: `201`
- Response shape:
```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": "...",
    "email": "qa_xxx@example.com",
    "name": null,
    "picture": null
  }
}
```

2. `GET /users/me` with `Authorization: Bearer <accessToken>`
- Status: `200`
- Response shape:
```json
{
  "id": "...",
  "email": "qa_xxx@example.com",
  "name": null,
  "picture": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

3. `GET /discovery/feed`
- Status: `403` before onboarding completion.
- Status: `200` with candidate array after onboarding completion.

4. `GET /matches/me`
- Status: `403` before onboarding completion.
- Status: `200` after onboarding completion (`[]` when no mutual likes exist).

## 4. Frontend Route-State QA

Executed in local browser at `http://localhost:5174`.

1. Public landing checks
- `/` contains manual-auth-only entry points.
- CTA mapping:
  - Start questionnaire -> `/start`
  - Sign in -> `/login`
  - Signup -> `/signup`

2. Guard checks (unauthenticated)
- Navigating to `/dashboard` redirects to `/`.
- Navigating to `/app/profile` redirects to `/login`.

3. Questionnaire integrity checks (`/start`)
- Step 1: housing intent + city.
- Step 2: min/max budget numeric bounds.
- Step 3: constrained enum/slider controls (sleep style, cleanliness, social level, gender preference).
- Step 4: explicit ranked priorities.
- Result: values are constrained to schema-compatible options and ranges.

4. Authenticated app checks
- Verified all core routes render and load:
  - `/app`
  - `/app/discover`
  - `/app/matches`
  - `/app/chat`
  - `/app/profile`

5. Data realism checks
- Dashboard shows backend-derived values:
  - preference budget range
  - city
  - gender preference
  - discovery count
  - active matches count
- Discovery card compatibility and profile data are API-driven.
- Matches empty state is coherent and non-crashing.

## 5. Key Fixes Included in This Verification Pass

1. Matching fallback for incomplete users
- File: `backend/src/modules/matching/matching.service.ts`
- Change: throw `ONBOARDING_REQUIRED` when profile/preferences are missing or onboarding is incomplete.

2. Real compatibility in matches
- File: `backend/src/modules/matches/matches.service.ts`
- Change: derive compatibility score from matching service output.

3. Auth conflict hardening
- Files:
  - `backend/src/modules/auth/auth.service.ts`
  - `backend/src/modules/auth/auth.controller.ts`
- Change: stable mapping for duplicate email and storage conflict paths.

4. User payload sanitization
- File: `backend/src/modules/users.controllers.ts`
- Change: `/users/me` now returns only safe fields.

5. Questionnaire + onboarding value sanitization
- Files:
  - `frontend/src/features/preauth/preauth.storage.ts`
  - `frontend/src/features/onboarding/onboarding.mapper.ts`
- Change: strict enum/range checks, clamping, and priority-order sanitization.

## 6. Validation Commands Run

Backend:
- `npm run dev` (runtime)
- `npx tsc --noEmit --pretty false` (typecheck)

Frontend:
- frontend server confirmed available on `5174`.
- Browser route and interaction QA executed live.

## 7. Non-Blocking Follow-up

- React Router v7 future-flag warning appears in local dev console. Functional behavior is correct; this can be cleaned up as a separate hygiene task.
