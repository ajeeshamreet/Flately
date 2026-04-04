# Phase 2 Validation Gates

Date: 2026-04-04
Scope: PA-003 and PA-004 only

## Gate 1: Endpoint Behavior Checks

Pass criteria:
- Profiles endpoints: read and upsert behavior unchanged for valid authenticated requests.
- Preferences endpoints: read and upsert behavior unchanged for valid authenticated requests.
- Matches endpoints: current list/action behavior remains unchanged.
- Discovery endpoints: feed/swipe behavior remains unchanged.
- Matching endpoints: request/response behavior remains unchanged.
- Users endpoints: lookup/create-or-read behavior remains unchanged.

## Gate 2: Unauthorized Checks

Pass criteria:
- Profiles/preferences/matches/discovery/matching/users endpoints return consistent unauthorized responses when auth context is missing or invalid.
- No endpoint in the Phase 2 surface bypasses auth checks introduced or standardized by PA-003.

## Gate 3: Invalid-Input Checks

Pass criteria:
- Invalid body/param/query payloads return deterministic 4xx responses with stable error structure.
- Domain errors mapped through PA-003 handling remain consistent across touched modules.

## Gate 4: Persistence Lifecycle Safety (PA-004)

Pass criteria:
- Create path and update path both pass for profiles and preferences using the shared lifecycle abstraction.
- User service get-or-create behavior remains functionally equivalent.
- No schema or migration dependency is introduced by Phase 2 changes.

## Gate 5: Build and Quality Expectations

Pass criteria:
- Type check passes.
- Build passes.
- Test suite passes (at minimum unit/integration coverage for touched behavior).

## Gate 6: Test harness hardening (pre-rollout requirement)

Pass criteria:
- backend has runnable test script
- at least one regression test for controller-chain unauthorized behavior
- at least one regression test for domain error mapping
- at least one regression test for INVALID_WEIGHTS behavior
- at least one regression test for shared upsert lifecycle branching (update vs create)
