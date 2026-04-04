# Phase 1 Environment Config Spec

Date: 2026-04-04
Scope: PA-006 only

## Objective

Define one frontend environment configuration contract for API, socket, and Auth0 wiring so runtime settings are environment-driven and not hardcoded in source.

## Current Verified State

- API client base URL is hardcoded to `http://localhost:4000`.
- Socket client URL is hardcoded to `http://localhost:4000`.
- Auth0 audience is hardcoded to `http://localhost:4000`.
- Auth0 domain and client ID are also currently hardcoded in frontend bootstrap.

## Required Frontend Environment Variables (Target)

- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`

## Contract Rules

- No transport or Auth0 host/audience literals should remain in frontend runtime wiring.
- Development, staging, and production must be switchable by environment values only.
- Variable names must be documented and stable for CI/CD and local setup.

## Acceptance for PA-006

- Environment variable contract is published and referenced by Phase 1 validation gates.
- Hardcoded localhost/audience values are removed during implementation phase.
