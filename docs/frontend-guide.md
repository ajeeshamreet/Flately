# Flately Frontend Guide

Last updated: 2026-04-05
Status: Current implementation reference

## 1. Scope

This document describes the current frontend implementation in detail.
It is intended for developers who need to run, maintain, or extend the frontend without guessing behavior.

Primary flow reference:
- docs/product-user-flow.md

Backend/API reference:
- docs/api-reference.md

Full project handoff:
- docs/complete-implementation-handoff.md

## 2. Frontend Stack

- React 19
- TypeScript 5
- Vite 7
- Redux Toolkit
- React Router v6
- Axios
- Socket.IO client
- Tailwind CSS v4

Frontend root directory:
- frontend/

## 3. Source Tree (Current)

```text
frontend/
  index.html
  package.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  vitest.config.ts
  src/
    main.tsx
    index.css
    app/
      AppLayout.tsx
      hooks.ts
      ProtectedRoute.tsx
      router.tsx
      store.ts
    config/
      runtimeConfig.ts
    features/
      auth/
        AuthBootstrap.tsx
        AuthProvider.tsx
        auth.storage.ts
        authSlice.ts
      preauth/
        PreAuthQuestionnairePage.tsx
        preauth.storage.ts
      onboarding/
        OnboardingPage.tsx
        onboarding.mapper.ts
        onboarding.mapper.test.ts
      dashboard/
        DashboardPage.tsx
      discovery/
        DiscoveryPage.tsx
      matches/
        MatchesPage.tsx
      chat/
        ChatPage.tsx
        chat.messages.ts
        chat.messages.test.ts
        chat.socket.ts
      profile/
        ProfileEditorPage.tsx
        profileSlice.ts
    pages/
      LandingPage.tsx
      LoginPage.tsx
      SignupPage.tsx
    services/
      api.ts
      auth.transport.ts
      profile.transport.ts
      preferences.transport.ts
      discovery.transport.ts
      matches.transport.ts
      chat.transport.ts
      cloudinary.ts
      transports.test.ts
    types/
      index.ts
```

## 4. Runtime Configuration

File: src/config/runtimeConfig.ts

Default values:
- apiBaseUrl: http://localhost:4000
- socketUrl: http://localhost:4000
- cloudinaryCloudName: empty
- cloudinaryUploadPreset: empty

Optional environment variables:
- VITE_API_BASE_URL
- VITE_SOCKET_URL
- VITE_CLOUDINARY_CLOUD_NAME
- VITE_CLOUDINARY_UPLOAD_PRESET

## 5. App Boot Sequence

File: src/main.tsx

Boot order:
1. Redux Provider
2. AuthProvider
3. AuthBootstrap
4. RouterProvider

Why this order matters:
- AuthProvider restores session and configures token/unauthorized handlers.
- AuthBootstrap fetches profile context for route guard decisions.
- Router receives ready auth/profile state before protected pages render.

## 6. Routing and Guard Model

File: src/app/router.tsx

Public routes:
- /
- /start
- /signup
- /login
- /auth/callback

Protected routes:
- /app
- /app/onboarding
- /app/discover
- /app/matches
- /app/chat/:matchId?
- /app/profile

Catch-all:
- * -> /

### Guard behavior

File: src/app/ProtectedRoute.tsx

Rules:
1. If auth is loading: show checking state.
2. If unauthenticated: redirect to /login.
3. If allowIncompleteProfile=true (onboarding route): allow entry.
4. If profile bootstrap failed: show retry block.
5. If profile not initialized/loading: show loading state.
6. If profile missing or onboardingCompleted is false: redirect to /app/onboarding.
7. Otherwise: allow protected content.

## 7. Auth Lifecycle

Files:
- src/features/auth/AuthProvider.tsx
- src/features/auth/authSlice.ts
- src/features/auth/auth.storage.ts
- src/features/auth/AuthBootstrap.tsx

Session model:
- accessToken + user persisted in localStorage
- storage key: flately.auth.session.v1

Auth flow:
1. AuthProvider reads persisted session.
2. If session exists:
   - dispatch setSession
   - register token getter for Axios
3. If no session:
   - dispatch finishAuthBootstrap (unauthenticated)
4. 401 interceptor (non-auth endpoints):
   - clear persisted session
   - clear auth state
   - redirect to /login?reason=session-expired
5. AuthBootstrap loads profile using getMyProfile.

Login/Signup pages:
- src/pages/LoginPage.tsx
- src/pages/SignupPage.tsx
- src/pages/GoogleAuthCallbackPage.tsx

Behavior:
- source=questionnaire query param shows questionnaire continuation message.
- Continue with Google button starts backend OAuth flow via /auth/google/start.
- OAuth callback exchanges one-time code through /auth/google/exchange and persists standard auth session.
- signup success routes to /app/onboarding.
- login success routes to /app.

## 8. Pre-Auth Questionnaire Handoff

Files:
- src/features/preauth/PreAuthQuestionnairePage.tsx
- src/features/preauth/preauth.storage.ts

Purpose:
- Collect baseline housing and preference signals before account creation.

Draft persistence:
- sessionStorage
- schema-validates enum and numeric ranges before use
- corrupted state is discarded automatically

Handoff:
- questionnaire -> /signup?source=questionnaire or /login?source=questionnaire
- onboarding reads this draft only when profile/preferences are missing

## 9. Onboarding System

Files:
- src/features/onboarding/OnboardingPage.tsx
- src/features/onboarding/onboarding.mapper.ts

Flow:
1. Load profile + preferences.
2. If onboarding already complete: redirect to /app.
3. Map server state into form model via mapper.
4. Optionally merge questionnaire draft.
5. Validate per-step before advance.
6. Submit profile and preferences payloads.
7. Clear questionnaire draft.
8. Dispatch profile state and navigate /app.

Data safety in mapper:
- enum sanitization (fallback to allowed values)
- numeric clamping for bounded fields
- priority order sanitization

Completion gate:
- Profile payload sets onboardingCompleted=true on final submit.

## 10. Feature Pages

### 10.1 Dashboard

File: src/features/dashboard/DashboardPage.tsx

Data loaded concurrently:
- preferences
- matches
- discovery feed

Outputs:
- completion blockers
- profile completion percentage
- pool health summary
- next best action CTA
- preference signal summary (budget/city/gender preference/weights)

### 10.2 Discovery

File: src/features/discovery/DiscoveryPage.tsx

Uses:
- GET /discovery/feed
- POST /discovery/swipe

Behavior:
- queue + detail panel
- pass action sends dislike
- connect action sends like
- result notice includes match confirmation when returned

### 10.3 Matches

File: src/features/matches/MatchesPage.tsx

Uses:
- GET /matches/me

Behavior:
- table listing mutual matches
- click row or button routes to /app/chat/:matchId

### 10.4 Chat

File: src/features/chat/ChatPage.tsx

Uses:
- GET /matches/me (thread list)
- GET /chat/:matchId (conversation bootstrap)
- Socket joinRoom + sendMessage
- Receives both message and new_message events for compatibility

Behavior:
- connection status badge: connected/reconnecting/connecting/disconnected
- send disabled unless socket connected and message non-empty

### 10.5 Profile Editor

File: src/features/profile/ProfileEditorPage.tsx

Tabs:
- My Profile
- Preferences

Validation:
- profile: name/city required
- preferences: maxBudget >= minBudget
- preferences weights must total 100

## 11. API Transport Layer

Files: src/services/*.ts

Core client:
- src/services/api.ts

Features:
- Axios instance with baseURL + timeout
- Authorization header injection via token getter
- centralized 401 handler for session expiry
- shared toApiErrorMessage parser (reads error or message fields)

Transport endpoint map:
- auth.transport.ts
  - POST /auth/login
  - POST /auth/signup
  - GET /users/me
- profile.transport.ts
  - GET /profiles/me
  - POST /profiles/me
- preferences.transport.ts
  - GET /preferences/me
  - POST /preferences/me
- discovery.transport.ts
  - GET /discovery/feed
  - POST /discovery/swipe
- matches.transport.ts
  - GET /matches/me
  - POST /matches/connect/:toUserId
- chat.transport.ts
  - GET /chat/:matchId

## 12. Onboarding-Gated Backend Contract

Frontend expectation:
- Before onboarding completion, matching/discovery/matches endpoints return HTTP 403 with:
  - {"message":"Onboarding completion is required"}

Frontend reaction:
- Route guard keeps incomplete users in /app/onboarding.
- If a direct API call still receives 403, error surfaces in page error state and user can retry after completing onboarding.

## 13. Redux State Model

Store file:
- src/app/store.ts

Slices:
- auth
  - status: loading | authenticated | unauthenticated
  - accessToken
  - user
  - error
- profile
  - data
  - loading
  - error
  - initialized

## 14. Styling System

File: src/index.css

Theme direction:
- light, high-readability command-center style
- custom colors via Tailwind v4 theme tokens
- reusable border/surface/canvas scale used across all feature pages

## 15. Cloudinary Integration

File: src/services/cloudinary.ts

Behavior:
- if cloud name or upload preset is missing: throws Cloudinary is not configured
- onboarding gracefully supports manual image URL entry as fallback

## 16. Testing and Verification

Frontend test files:
- src/features/chat/chat.messages.test.ts
- src/features/onboarding/onboarding.mapper.test.ts
- src/services/transports.test.ts

Commands:
```bash
cd frontend
npm run test
npm run typecheck
npm run lint
npm run build
```

Latest verified status (2026-04-05):
- tests: pass
- typecheck: pass
- lint: pass
- build: pass

## 17. Local Development Runbook

1. Start backend:
```bash
cd backend
npm run dev
```

2. Start frontend:
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5174
```

3. Open app:
- http://localhost:5174

4. Smoke path:
- /start -> /signup -> /app/onboarding -> /app -> /app/discover -> /app/matches -> /app/chat -> /app/profile

## 18. Maintenance Rules

1. Keep docs/product-user-flow.md and this file in sync whenever guard/route behavior changes.
2. Keep Auth0 out of runtime UI and use only backend-managed Google OAuth + email/password auth.
3. Do not bypass onboarding gate for discovery/matches/chat routes.
4. Keep transport contracts aligned with docs/api-reference.md before release.
