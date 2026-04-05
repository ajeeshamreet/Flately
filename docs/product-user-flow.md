# Flately Canonical User Flow

Last updated: 2026-04-05
Status: Active source of truth

## Scope

This document defines the production user journey for Flately.

- Authentication mode: email/password and Google OAuth
- No Auth0 redirects or Auth0 dependencies in runtime flow
- No non-functional CTAs on public or app routes
- Dashboard must prioritize actionability over vanity metrics

## User states

1. Unauthenticated
2. Authenticated - onboarding incomplete
3. Authenticated - onboarding complete
4. Error recovery state (auth, profile load, discovery, chat)

## Route and guard contract

Public routes:
- `/`
- `/start`
- `/signup`
- `/login`

Protected routes:
- `/app`
- `/app/onboarding`
- `/app/discover`
- `/app/matches`
- `/app/chat/:matchId?`
- `/app/profile`

Guard rules:
1. Unauthenticated access to `/app/*` redirects to `/login`.
2. Authenticated users with incomplete onboarding redirect to `/app/onboarding` except when already on onboarding.
3. Authenticated users with completed onboarding can access all `/app/*` routes.

## Primary journey

1. Landing
- Entry at `/`
- Primary CTA: start questionnaire (`/start`)
- Secondary CTA: login (`/login`)
- Tertiary CTA: signup (`/signup`)

2. Pre-auth questionnaire
- Route: `/start`
- Collect baseline: housing intent, city, budget, lifestyle, ranking priorities
- Persist draft locally and hand off to signup/login

3. Signup or login
- Signup route: `/signup`
- Login route: `/login`
- API endpoints:
  - `POST /auth/signup`
  - `POST /auth/login`
  - `GET /auth/google/start`
  - `GET /auth/google/callback`
  - `GET /auth/google/exchange`
- On success, persist session and load profile bootstrap

4. Onboarding gate
- Route: `/app/onboarding`
- Prefill from questionnaire draft when profile/preferences are missing
- Submit to:
  - `POST /profiles/me`
  - `POST /preferences/me`
- Completion sets `onboardingCompleted = true`

5. Dashboard coaching hub
- Route: `/app`
- Must show:
  - completion blockers (what is missing)
  - match eligibility / pool health status
  - one next best action CTA

6. Discovery
- Route: `/app/discover`
- Endpoint: `GET /discovery/feed`
- Swipe endpoint: `POST /discovery/swipe`

7. Matches
- Route: `/app/matches`
- Endpoint: `GET /matches/me`

Backend gate contract:
- Before onboarding completion, discovery/matching/matches actions return `403` with `Onboarding completion is required`.
- A user must have profile + preferences + `onboardingCompleted=true` before these routes are usable.

8. Chat
- Route: `/app/chat/:matchId?`
- Open conversation and send messages via chat transport and socket

9. Profile edits
- Route: `/app/profile`
- User can refine profile and preferences post-onboarding

## Error and recovery paths

1. Invalid credentials
- Show clear login/signup error
- Keep user on current form and preserve entered email

2. Session expired
- Redirect to `/login?reason=session-expired`
- Show one-time message and remove reason query param

3. Profile bootstrap failure
- Show retry state with explicit action
- Do not silently continue into protected surfaces

4. Onboarding save failure
- Keep form state and show API error details
- Allow resubmission without data loss

5. Discovery/matches/chat data failure
- Show actionable retry control
- Do not crash route shell

## API contract summary

Auth:
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/google/start`
- `GET /auth/google/callback`
- `GET /auth/google/exchange`

Profile and preference:
- `GET /profiles/me`
- `POST /profiles/me`
- `GET /preferences/me`
- `POST /preferences/me`

Matching/discovery:
- `GET /discovery/feed`
- `POST /discovery/swipe`
- `GET /matches/me`

## Anti-goals

- No Auth0 login buttons or Auth0 redirect/callback paths
- No stale copy referencing Auth0 in auth screens
- No dashboard cards that show counts without telling the user what to do next
