# Phase 3 Validation Gates

Date: 2026-04-04
Scope: P3-005-A (completed), P3-005-B (approved), P3-002-A (approved), P3-002-B (approved)

## Gate 1: Payload Parity (Golden Discovery Output)

Pass criteria:
- Discovery output for representative golden scenarios matches baseline payloads exactly.
- No field-level drift in response structure, ordering expectations, or value semantics without approved golden updates.

## Gate 2: Query Fan-out Reduction Evidence

Pass criteria:
- Evidence shows batched query behavior replaces per-candidate query fan-out in discovery flow.
- Measured query count for equivalent discovery requests is reduced or equal, never increased.
- Evidence is captured in tests, logs, or benchmark notes tied to P3-005-A.

## Gate 3: Matches Payload Parity and Fan-out Reduction (P3-005-B)

Pass criteria:
- Matches payload output for approved golden scenarios remains parity-equivalent before/after P3-005-B.
- Internal query fan-out for the targeted matches flow is reduced (or at minimum not increased) with evidence attached.
- Any approved golden fixture updates are traceable and justified as non-contractual.

## Gate 4: Expanded Matching Golden-Output Parity (P3-002-A)

Pass criteria:
- A before/after golden-output suite for matching is executed around the seam refactor.
- Output parity is preserved for all required scenarios, including ordering/ranking semantics.
- No unexplained drift is allowed; any expected differences must be pre-approved.

## Gate 5: Expanded Matching Golden Suite (P3-002-B)

Pass criteria:
- A dedicated expanded golden suite is executed for P3-002-B with all required scenarios:
  - budget boundary equality
  - missing candidate preference skip
  - viewer-weights dominance
  - tie-order stability
- Scenario outcomes are deterministic and match approved golden expectations.
- No matching-output drift is allowed unless approved and captured through additional golden tests.

## Gate 6: No Route or Contract Changes (P3-005-B, P3-002-A, and P3-002-B)

Pass criteria:
- Discovery routes and methods remain unchanged.
- Matches and matching routes/methods remain unchanged.
- Response contract shapes remain unchanged for existing consumers.
- No API surface or integration contract updates are required for any approved ID.

## Gate 7: Build, Typecheck, and Test Pass

Pass criteria:
- Build passes.
- Typecheck passes.
- Test suite passes, including new or updated golden parity tests for discovery behavior.

## Gate 8: Hardening-only guardrails

Pass criteria:
- only test files changed
- all targeted golden suites pass
- backend typecheck passes
- route/controller/service production files unchanged
