# Phase 1 Validation Gates

Date: 2026-04-04
Scope: PA-001 and PA-006 only

## Gate 1: Contract Documentation Completeness

Pass criteria:
- REST and socket matrix exists for PA-001 with current and target contract states.
- Environment config spec exists for PA-006 with required variable contract.

## Gate 2: Contract Alignment Readiness (PA-001)

Pass criteria:
- One canonical discovery endpoint is defined.
- One canonical connect/swipe endpoint contract is defined.
- One canonical socket naming scheme is defined, with temporary compatibility mapping documented.

## Gate 3: Environment Wiring Readiness (PA-006)

Pass criteria:
- API base URL, socket URL, and Auth0 audience are sourced from environment variables.
- Required variable names are documented for local and deployment environments.

## Gate 4: Basic Regression Safety

Pass criteria:
- Discovery load, connect/swipe action, matches list load, and chat open/send/receive flows are each represented in a validation checklist.
- Rollback note exists for contract alias removal timing.

## Gate 5: Build Quality Checks

Pass criteria:
- Type check passes.
- Lint passes.
- Tests pass for affected Phase 1 paths.
