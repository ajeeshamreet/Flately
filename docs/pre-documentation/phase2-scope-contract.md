# Phase 2 Scope Contract

Date: 2026-04-04
In-scope IDs: PA-003, PA-004

## Scope Statement

Phase 2 is limited to:
- PA-003: standardize controller precondition and error-handling flow using middleware-style chaining.
- PA-004: remove duplicated create-or-update lifecycle logic in profile/preference/user services.

## In Scope

- Controller-level cross-cutting behavior alignment for profiles, preferences, matches, discovery, matching, and users endpoints.
- Consistent unauthorized and domain-error response mapping for touched endpoints.
- Shared upsert lifecycle abstraction for profile/preference/user persistence flows.

## Out of Scope

- PA-001, PA-002, PA-005, PA-006 implementation changes.
- Any matching algorithm/core scoring or ranking logic changes.
- Database schema changes or data migrations.
- Frontend transport/UI behavior changes, except compatibility verification.

## Contract-Preservation Rules

- Preserve existing endpoint paths, HTTP methods, and required auth behavior.
- Preserve response payload shape for success paths on profiles/preferences/matches/discovery/matching/users routes.
- Preserve existing status-code semantics unless correcting a clearly invalid current response.
- Introduce compatibility mapping when internal error normalization changes could alter external payloads.

## Rollback Strategy

- Keep Phase 2 changes behind a limited, reviewable commit surface (PA-003 and PA-004 files only).
- Revert PA-003 middleware/controller changes first if API behavior regressions are detected.
- Revert PA-004 shared lifecycle abstraction independently if persistence behavior deviates.
- Validate rollback with endpoint smoke checks and typecheck/build/test gates before redeploy.
