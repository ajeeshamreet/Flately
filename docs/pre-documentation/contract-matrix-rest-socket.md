# Contract Matrix (REST + Socket)

Date: 2026-04-04
Scope: PA-001 only

## REST Contract Matrix

| Flow | Frontend Call (Current) | Backend Route (Current) | Status | Phase 1 Canonical Contract Target |
|---|---|---|---|---|
| Discovery feed load | `GET /discovery` | `GET /discovery/feed` | Drift | Define one canonical discovery feed path and keep compatibility mapping during rollout. |
| Connect/like action | `POST /matches/connect/:id` | `POST /discovery/swipe` (body: `toUserId`, `action`) | Drift | Define one canonical connect/swipe contract and map old callers during transition. |
| My matches list | `GET /matches/me` | `GET /matches/me` | Aligned | Keep unchanged in Phase 1. |
| Open chat by match | `GET /chat/:matchId` | `GET /chat/:matchId` | Aligned | Keep unchanged in Phase 1. |

## Socket Contract Matrix

| Capability | Frontend Runtime Usage | Backend Runtime Usage | Typed Contract Surface | Status | Phase 1 Canonical Contract Target |
|---|---|---|---|---|---|
| Join conversation room | `join` | `join` | `join`, `joinRoom` | Partial drift | Select one canonical join event name and map legacy alias. |
| Send message | `send_message` | `send_message` | `send_message`, `sendMessage` | Partial drift | Select one canonical send event name and map legacy alias. |
| Receive message | `new_message` | `new_message` | `new_message`, `message` | Partial drift | Select one canonical receive event name and map legacy alias. |

## Notes

- Runtime chat flow is currently functional on snake_case event names.
- Type definitions currently carry both snake_case and camelCase names, indicating contract duplication risk.
