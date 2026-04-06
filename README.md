# Flately - End-to-End Flows and Flaw Backlog

Last updated: 2026-04-06

## 1. Product Status

Flately now runs with:

- Email/password auth
- Google OAuth auth (backend-managed redirect flow)
- JWT-protected app routes
- Strict onboarding gate for discovery and matching actions

Auth0 is not used in runtime auth flow.

## 2. End-to-End Flow Inventory

### 2.1 Public Flows

1. Landing: `/`
2. Pre-auth questionnaire: `/start`
3. Signup: `/signup`
4. Login: `/login`
5. Google OAuth callback completion page: `/auth/callback`

### 2.2 Authentication Flows

1. Email signup
   - Frontend form submits to `POST /auth/signup`
   - Session is persisted locally
   - User is routed to `/app/onboarding`

2. Email login
   - Frontend form submits to `POST /auth/login`
   - Session is persisted locally
   - User is routed to `/app`

3. Google OAuth login/signup
   - Frontend starts flow via `GET /auth/google/start`
   - Backend receives callback at `GET /auth/google/callback`
   - Frontend exchanges one-time code at `GET /auth/google/exchange`
   - Session is persisted locally
   - User is routed to `/app`

### 2.3 Protected Product Flows

1. Onboarding wizard: `/app/onboarding`
2. Dashboard: `/app`
3. Discovery: `/app/discover`
4. Matches: `/app/matches`
5. Chat: `/app/chat/:matchId?`
6. Profile and preferences editor: `/app/profile`
7. Sign out -> `/login`

## 3. Route Guard and Contract Rules

1. Unauthenticated user trying `/app/*` is redirected to `/login`.
2. Authenticated but incomplete onboarding user is redirected to `/app/onboarding`.
3. Backend enforces onboarding completion for discovery/matching routes with HTTP `403`.
4. Session expiry triggers redirect to `/login?reason=session-expired`.

## 4. Flaw Backlog (Business + UX)

Severity: High

1. Discovery conversion confusion after first like.
   - Symptom: users can like a profile, then see no matches without clear pending/mutual explanation.
   - Impact: drop-off risk in core conversion loop.
   - Recommendation: add explicit request state (`pending`, `mutual`, `rejected`) and messaging in discovery + matches.

Severity: Medium

2. Completion blockers wording vs route behavior can be perceived as inconsistent.
   - Symptom: dashboard says blockers exist while some core routes still load.
   - Impact: trust and guidance ambiguity.
   - Recommendation: classify as `hard blockers` vs `quality recommendations` with distinct copy.

3. Chat empty-state wording can imply loading uncertainty.
   - Symptom: empty thread view includes loading-like language in some states.
   - Impact: perceived instability.
   - Recommendation: deterministic empty-state copy with explicit next action.

4. Returning users from questionnaire still have extra friction.
   - Symptom: login branch appears later in questionnaire progression.
   - Impact: unnecessary steps for existing users.
   - Recommendation: add immediate login action in early questionnaire step.

Severity: Low

5. React Router v7 future-flag warning appears in local dev console.
   - Impact: no user-facing breakage now.
   - Recommendation: planned router future-flag migration.

## 5. Flaws Fixed In This Pass

1. Auth error UX now avoids raw technical messages.
   - Login/signup/Google callback now map backend error codes to user-friendly copy.

2. No-Auth0 naming confusion reduced in backend runtime code.
   - Middleware path is now `backend/src/middlewares/jwt.middleware.ts`.

3. Google OAuth integration added without breaking existing email/password users.
   - New endpoints:
     - `GET /auth/google/start`
     - `GET /auth/google/callback`
     - `GET /auth/google/exchange`
   - Existing endpoints remain unchanged:
     - `POST /auth/signup`
     - `POST /auth/login`

4. OAuth fallback redirect now returns to the active frontend origin.
   - Prevents wrong-port redirect issues during local development.

5. Frontend API transport migrated from Axios to manual fetch architecture.
   - Replaced Axios transport with Adapter + Strategy in `frontend/src/services/api.ts`.
   - Kept existing service call contract unchanged, so feature modules still call `apiRequest(...)`.
   - Preserved auth token injection and one-shot `401` unauthorized handling behavior.
   - Added a structured manual error model (`ApiError`) so existing UI error mapping still works.

Pattern fit for transport:

- Strategy: `FetchRequestStrategy` handles low-level HTTP execution.
- Adapter: `HttpClientAdapter` adapts app-level request config to the strategy and centralizes cross-cutting auth behavior.

## 6. Google OAuth Environment Variables

Set these in `backend/.env`:

```env
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
GOOGLE_OAUTH_CALLBACK_URL=http://localhost:4000/auth/google/callback
FRONTEND_URL=http://localhost:5174
```

Without Google env values, Google sign-in gracefully redirects to login with a clear configuration error.

## 7. Verification Snapshot

Validated in this pass:

- Backend typecheck: pass
- Backend tests: pass
- Backend build: pass
- Frontend typecheck: pass
- Frontend tests: pass
- Frontend build: pass
- Browser smoke check:
  - Google button present on login/signup
  - Missing-config Google flow returns to login with user-friendly message
