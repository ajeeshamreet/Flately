# Phase 1 Scope Contract

Date: 2026-04-04
In-scope IDs: PA-001, PA-006

## Scope Statement

Phase 1 is limited to:
- PA-001: align frontend and backend contracts for discovery/connect/chat transport boundaries (REST and socket naming).
- PA-006: replace hardcoded frontend transport/auth environment values with environment-driven configuration.

## In Scope

- Discovery endpoint contract alignment.
- Connect/swipe action contract alignment.
- Socket event name canonicalization plan with compatibility mapping.
- Frontend config contract for API base URL, socket URL, and Auth0 audience.

## Out of Scope

- PA-002, PA-003, PA-004, PA-005.
- Matching algorithm behavior changes.
- Database schema changes.
- Backend business-rule refactors beyond contract compatibility work.

## Current Baseline (Verified)

- Frontend discovery read path: `/discovery`.
- Frontend connect action path: `/matches/connect/:id`.
- Backend discovery paths: `/discovery/feed` and `/discovery/swipe`.
- Backend matches path: `/matches/me`.
- Chat socket runtime events: `join`, `send_message`, `new_message`.
- Frontend hardcoded host/audience values point to localhost.

## Phase 1 Exit Criteria

- One documented canonical REST contract for discovery/connect/chat flows.
- One documented canonical socket event contract with compatibility strategy.
- One documented frontend environment variable contract replacing hardcoded values.
- Validation gates defined and ready for implementation phase.
