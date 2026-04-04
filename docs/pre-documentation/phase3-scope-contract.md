# Phase 3 Scope Contract

Date: 2026-04-04
In-scope IDs: P3-005-A (completed), P3-005-B (approved), P3-002-A (approved), P3-002-B (approved)

## Scope Statement

Phase 3 includes completed P3-005-A and approved next scopes P3-005-B, P3-002-A, and P3-002-B.

## ID Boundaries

### P3-005-A (Completed)

- Boundary: discovery enrichment/query-structure optimization only.
- Files: backend/src/modules/discovery/discovery.service.ts and discovery tests.
- Constraint carryover: no route/response-contract changes.

### P3-005-B (Approved)

- Boundary: matches payload parity and fan-out reduction work in matches service path.
- Files: backend/src/modules/matches/matches.service.ts and matches tests.
- Constraints: preserve payload semantics; no route/response-contract changes.

### P3-002-A (Approved)

- Boundary: matching seam refactor only, without output changes.
- Files: backend/src/modules/matching/matching.service.ts and matching tests/snapshots.
- Constraints: golden-output parity required before/after seam refactor; no route/response-contract changes.

### P3-002-B (Approved)

- Boundary: matching edge-case parity hardening and deterministic ordering validation only.
- Files: backend/src/modules/matching/matching.service.ts and backend/src/modules/matching/matching.service.test.ts.
- Constraints: no route/response-contract changes; no matching-output drift without additional golden tests.

## In Scope

- Internal service-level refactors and test updates within the ID boundaries above.
- Golden output and parity validation updates needed to prove behavior preservation.
- Performance-oriented fan-out reduction where explicitly scoped by ID.
- Expanded matching golden-suite coverage for approved P3-002-B edge cases.

## Out of Scope

- Any API route changes.
- Any response payload contract changes.
- Any matching-core ranking/decision behavior changes.
- Any edits outside the approved per-ID file boundaries except supporting tests.

## Contract-Preservation Rules

- Preserve all existing discovery endpoint routes, methods, and response shapes.
- Preserve all existing matches and matching endpoint routes, methods, and response shapes.
- Preserve matching output semantics; no output drift is allowed unless captured and approved through golden tests.
- Keep external request and response contracts stable for all existing clients.
- Keep each implementation slice limited to the approved ID boundary files and related tests.

## Rollback Plan

- Keep P3-005-A changes isolated to discovery service and tests in a reviewable commit slice.
- Revert discovery service refactor first if parity or contract regressions are detected.
- Re-run payload parity, route/contract, and build/typecheck/test gates after rollback.
- Ship rollback only after gates return to passing baseline.
