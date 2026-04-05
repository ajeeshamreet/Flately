# Frontend Rebuild Status (2026-04-05)

## Scope Completed In This Slice

### 1. Rebuild Orchestration Assets (Viberes)
- Added orchestration agent: `.github/agents/flately-frontend-orchestrator.agent.md`.
- Added phase plan prompt: `.github/prompts/flately-frontend-phase-plan.md`.
- Added rebuild instruction set: `.github/instructions/flately-frontend-rebuild.instructions.md`.
- Updated `.github/agents/Frontend.md` with approved overrides:
	- single frontend root: `flately-full_stack/frontend`
	- hard auth cutover from Auth0
	- no mock/demo policy in production pages
	- hide unsupported routes until backend support exists

### 2. New Frontend Foundation (`flately-full_stack/frontend`)
- Created fresh Vite + React + TypeScript app scaffold.
- Added baseline architecture:
	- app shell + protected routing
	- auth provider and bootstrap flow
	- auth/profile Redux slices
	- API transport layer
	- runtime config boundary
- Added route-level placeholders for:
	- onboarding
	- dashboard
	- discovery
	- matches
	- chat

### 3. Backend Auth Cutover Scaffold
- Added auth module:
	- `backend/src/modules/auth/auth.service.ts`
	- `backend/src/modules/auth/auth.controller.ts`
	- `backend/src/modules/auth/auth.routes.ts`
- Mounted `/auth` routes in `backend/src/app.ts`.
- Switched env contract from Auth0-focused keys to JWT/Google keys in `backend/src/config/env.ts`.
- Replaced auth middleware behavior in `backend/src/middlewares/auth0.middleware.ts` with local JWT bearer verification while preserving import path compatibility.
- Updated user profile coupling in users service/controller to first-party identity fields.
- Updated Prisma user model (`passwordHash`, `googleId`, `updatedAt`) in `backend/prisma/schema.prisma`.

## Correctness and Validation
- Backend:
	- `npx prisma generate` completed successfully.
	- `npm run typecheck` completed successfully.
- Frontend:
	- `npm run typecheck` completed successfully.
	- `npm run lint` completed successfully.
	- `npm run build` completed successfully.

## Follow-Up Diagnostics Fixed In This Pass
- Added explicit input-label associations (`htmlFor`/`id`) in login/signup forms for accessibility diagnostics.
- Standardized two width utilities to `max-w-275` where flagged.
- Reworked CSS token declarations to avoid unsupported at-rule diagnostics while retaining existing class behavior.

## Phase Completion Matrix (1 -> 8)
1. Phase 1 - Foundation and contracts: complete.
2. Phase 2 - Auth/bootstrap and protected routing gate: complete.
3. Phase 3 - Onboarding wizard (6-step real payload flow): complete.
4. Phase 4 - Dashboard real API integration: complete.
5. Phase 5 - Discovery real API integration: complete.
6. Phase 6 - Matches real API integration: complete.
7. Phase 7 - Chat real API/socket integration: complete.
8. Phase 8 - Profile editor + UX hardening + cleanup + tests: complete.

## User Flow Closure
- Landing -> auth -> app shell is wired.
- Protected onboarding gate is enforced across `/app/*` routes.
- Onboarding submit persists profile and preferences with real backend contracts.
- Dashboard shows live profile/match/chat state with retry/error handling.
- Discovery supports pass/like via canonical swipe contract and queue progression.
- Matches list opens conversations and deep links into chat.
- Chat supports message history + real-time socket updates with reconnect handling.
- Profile editor route (`/app/profile`) supports editing profile + preferences.

## Residual Risks
- Discovery detail richness depends on backend feed shape (candidate cards currently render available contract fields only).
- Chat optimistic local send append is not enabled to avoid duplicate UI entries when socket echo order varies.

## Latest Validation
- Frontend `npm run typecheck`: pass.
- Frontend `npm run lint`: pass.
- Frontend `npm test`: pass.
- Frontend `npm run build`: pass.

## Runtime Verification and Stabilization (Manual Auth Only)

### Backend runtime restart and contract verification
- Relaunched backend from `backend` package root (`npm run dev`) and verified listener on port `4000`.
- Verified endpoint base path is root-mounted (`/auth`, `/users`, `/discovery`, `/matches`) rather than `/api/v1/*`.
- Re-ran manual-auth smoke checks using fresh users:
	- `POST /auth/signup` returns `201` with `accessToken` + `user`.
	- `GET /users/me` returns `200`.
	- `GET /discovery/feed` returns `200` with array payload.
	- `GET /matches/me` returns `200` with array payload.

### Issues fixed in this stabilization pass
1. Discovery 500 for incomplete profiles/preferences
- Root cause: matching path threw when either profile or preferences was missing.
- Fix: strict onboarding domain contract enforced. Missing profile/preferences or incomplete onboarding now returns `ONBOARDING_REQUIRED`, mapped to HTTP `403` on discovery/matches routes.
- File: `backend/src/modules/matching/matching.service.ts`.

2. Matches compatibility hardcoded instead of real score
- Root cause: matches service used a static compatibility value (`85`).
- Fix: matches now derive compatibility from `findMatchesForUser` output.
- File: `backend/src/modules/matches/matches.service.ts`.

3. Signup unique-storage conflict handling
- Root cause: unique-index conflicts could surface as ambiguous failures.
- Fix: explicit mapping to `EMAIL_ALREADY_EXISTS` and fallback `AUTH_STORAGE_CONFLICT`.
- Files:
	- `backend/src/modules/auth/auth.service.ts`
	- `backend/src/modules/auth/auth.controller.ts`

4. Sensitive user data leak on `/users/me`
- Root cause: route returned full Prisma user object including `passwordHash`.
- Fix: route now returns a sanitized payload (`id`, `email`, `name`, `picture`, `createdAt`, `updatedAt`).
- File: `backend/src/modules/users.controllers.ts`.

5. Questionnaire/onboarding schema drift prevention
- Root cause: session drafts and mapper allowed values outside backend schema expectations.
- Fixes:
	- strict enum/range validation for questionnaire draft read/write.
	- enum pickers + numeric clamping + priority-order sanitization in onboarding mapper.
- Files:
	- `frontend/src/features/preauth/preauth.storage.ts`
	- `frontend/src/features/onboarding/onboarding.mapper.ts`

### Browser route-state QA (local)
Executed against frontend on `http://localhost:5174`:

1. Public landing and auth CTAs
- `/` renders only manual-auth CTAs (`/start`, `/login`, `/signup`).
- No OAuth/Auth0 entry points present.

2. Guard behavior (unauthenticated)
- Direct navigation to `/dashboard` redirects to `/`.
- Direct navigation to `/app/profile` redirects to `/login`.

3. Questionnaire UX and option integrity
- `/start` flow uses constrained controls (buttons, selects, sliders, bounded numeric fields).
- Priority ordering step uses explicit ranking controls.

4. Authenticated app shell and feature routes
- Verified render and data load for:
	- `/app`
	- `/app/discover`
	- `/app/matches`
	- `/app/chat`
	- `/app/profile`

5. Data realism checks
- Dashboard shows backend-driven values for budget/city/gender preference and computed counts.
- Discovery cards and compatibility values are populated from API payload.
- Matches empty state is consistent when no mutual likes exist.

### Remaining non-blocking observation
- React Router v7 future-flag warning appears in browser console during local dev. This is not a functional blocker but can be cleaned up by opting into documented future flags.
