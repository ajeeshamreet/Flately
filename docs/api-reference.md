# Flately — Complete API Reference

> **Base URL**: `http://localhost:4000`  
> **Auth**: All endpoints (except `/health`) require `Authorization: Bearer <JWT>` header  
> **Content-Type**: `application/json`

---

## Authentication

All protected endpoints use the Auth0 JWT middleware pipeline:

```
Authorization: Bearer <access_token>
```

The token is obtained via `getAccessTokenSilently()` from `@auth0/auth0-react` on the frontend. The middleware validates against Auth0's JWKS endpoint and extracts `req.userId = req.auth.payload.sub`.

---

## 1. Health Check

### `GET /health`

No auth required. Returns server status.

**Response:**
```json
{ "status": "ok" }
```

---

## 2. Users Module

### `GET /users/me`

Get or create the authenticated user's record. Called automatically by `AuthSync` on login.

**Auth**: Required  
**Middleware**: `checkJwt → attachUserId → getUserProfile`

**Logic:**
1. Extract `sub`, `email`, `name`, `picture` from JWT payload
2. Look up User by `auth0id == payload.sub`
3. If not found → create new User
4. Return User object

**Response (200):**
```json
{
  "id": "665f1a2b3c4d5e6f7a8b9c0d",
  "auth0id": "auth0|abc123def456",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "createdAt": "2026-03-20T10:30:00.000Z"
}
```

**Error Responses:**
- `401` — Missing or invalid JWT
- `500` — Internal server error

---

## 3. Profiles Module

### `GET /profiles/me`

Get the authenticated user's profile.

**Auth**: Required  
**Response (200):**
```json
{
  "id": "665f1a2b3c4d5e6f7a8b9c0e",
  "userId": "665f1a2b3c4d5e6f7a8b9c0d",
  "name": "John Doe",
  "age": 26,
  "gender": "male",
  "bio": "Looking for a clean roommate...",
  "photos": ["https://..."],
  "city": "San Francisco",
  "hasRoom": true,
  "occupation": "professional",
  "sleepSchedule": "night-owl",
  "noiseLevel": 3,
  "guestPolicy": "sometimes",
  "smoking": "no",
  "pets": "love",
  "onboardingCompleted": true,
  "createdAt": "2026-03-20T10:30:00.000Z",
  "updatedAt": "2026-03-20T10:35:00.000Z"
}
```

Returns `null` if no profile exists yet.

---

### `POST /profiles/me`

Create or update the authenticated user's profile. Used by the onboarding flow.

**Auth**: Required  
**Request Body:**
```json
{
  "name": "John Doe",
  "age": 26,
  "gender": "male",
  "bio": "Looking for a clean roommate",
  "photos": ["https://..."],
  "city": "San Francisco",
  "hasRoom": true,
  "occupation": "professional",
  "sleepSchedule": "night-owl",
  "noiseLevel": 3,
  "guestPolicy": "sometimes",
  "smoking": "no",
  "pets": "love"
}
```

**All fields are optional.** Undefined fields are stripped before save. `onboardingCompleted` is automatically set to `true`.

**Logic:**
1. Extract all known fields from `req.body`
2. Remove `undefined` entries
3. If profile exists → `prisma.profile.update()`
4. If not → `prisma.profile.create()` with `userId`

**Response (200):** Updated/created Profile object (same schema as GET)

---

## 4. Preferences Module

### `GET /preferences/me`

Get the authenticated user's matching preferences.

**Auth**: Required  
**Response (200):**
```json
{
  "id": "665f1a2b3c4d5e6f7a8b9c0f",
  "userId": "665f1a2b3c4d5e6f7a8b9c0d",
  "genderPreference": "any",
  "minBudget": 1200,
  "maxBudget": 2000,
  "city": "San Francisco",
  "cleanliness": 4,
  "sleepSchedule": 3,
  "smoking": false,
  "drinking": true,
  "pets": true,
  "socialLevel": 4,
  "weightCleanliness": 30,
  "weightSleep": 25,
  "weightHabits": 20,
  "weightSocial": 25,
  "createdAt": "2026-03-20T10:30:00.000Z",
  "updatedAt": "2026-03-20T10:35:00.000Z"
}
```

Returns `null` if no preferences set yet.

---

### `POST /preferences/me`

Create or update preferences. Validates that weights sum to 100.

**Auth**: Required  
**Request Body:**
```json
{
  "genderPreference": "any",
  "minBudget": 1200,
  "maxBudget": 2000,
  "city": "San Francisco",
  "cleanliness": 4,
  "sleepSchedule": 3,
  "smoking": false,
  "drinking": true,
  "pets": true,
  "socialLevel": 4,
  "weightCleanliness": 30,
  "weightSleep": 25,
  "weightHabits": 20,
  "weightSocial": 25
}
```

**Validation:**
```
weightCleanliness + weightSleep + weightHabits + weightSocial === 100
```
If not → returns `400 { error: "Weights must sum to 100" }`

**Response (200):** Updated/created Preference object

---

## 5. Matching Module

### `GET /matching/me`

Compute compatibility scores for the authenticated user against all other eligible users.

**Auth**: Required  
**Response (200):**
```json
[
  { "userId": "665f...001", "score": 87 },
  { "userId": "665f...002", "score": 72 },
  { "userId": "665f...003", "score": 65 }
]
```

Sorted by score descending.

**Error Responses:**
- `400 { message: "Complete profile and preferences first" }` — Profile or preferences missing

**Algorithm:** See `docs/matching-algorithm.md` for full details.

---

## 6. Discovery Module

### `GET /discovery/feed`

Get the discovery feed — ranked potential roommates excluding already-swiped users.

**Auth**: Required  
**Response (200):**
```json
[
  {
    "id": "665f...001",
    "name": "Sarah Mitchell",
    "age": 26,
    "gender": "female",
    "occupation": "UX Designer",
    "city": "San Francisco",
    "hasRoom": true,
    "photos": ["https://..."],
    "compatibility": 87,
    "budgetMin": 1200,
    "budgetMax": 2000,
    "tags": ["Has Room", "Non-Smoker", "Clean & Tidy", "UX Designer"]
  }
]
```

**Logic:**
1. Get all swipes by current user → `excludedUserIds`
2. Run matching algorithm → ranked scores
3. Filter out already-swiped users
4. Enrich each candidate with profile, preference, and auto-generated tags
5. Return array (sorted by compatibility score, descending)

**Tag generation rules:**
- `hasRoom === true` → "Has Room"
- `pets === true` → "Pet Friendly"
- `smoking === false` → "Non-Smoker"
- `cleanliness >= 4` → "Clean & Tidy"
- `socialLevel >= 4` → "Social"
- `socialLevel <= 2` → "Quiet"
- `sleepSchedule <= 2` → "Early Bird"
- `sleepSchedule >= 4` → "Night Owl"
- `occupation` → added as tag if present
- Maximum 4 tags returned

---

### `POST /discovery/swipe`

Record a swipe action on a potential roommate.

**Auth**: Required  
**Request Body:**
```json
{
  "toUserId": "665f...001",
  "action": "like"       // "like" | "dislike" | "skip" | "superlike"
}
```

**Action normalization:**
- `"superlike"` → stored as `"like"`
- `"skip"` → stored as `"dislike"`

**Logic:**
1. Upsert `Swipe` record (fromUserId, toUserId)
2. If action is `"like"`:
   a. Check for reverse swipe (toUser liked fromUser)
   b. If mutual like → create Match + return `{ swipe, matched: true }`
3. Return `{ success: true }`

**Response (200):**
```json
{ "success": true }
```

---

## 7. Matches Module

### `GET /matches/me`

Get all confirmed matches for the authenticated user with enriched data.

**Auth**: Required  
**Response (200):**
```json
[
  {
    "id": "665f...match001",
    "matchedAt": "2026-03-20T10:30:00.000Z",
    "createdAt": "2026-03-20T10:30:00.000Z",
    "otherUser": {
      "id": "665f...001",
      "name": "Sarah Mitchell",
      "age": 26,
      "gender": "female",
      "occupation": "UX Designer",
      "city": "San Francisco",
      "hasRoom": true,
      "photos": ["https://..."],
      "budgetMin": 1200,
      "budgetMax": 2000,
      "tags": ["Has Room", "Non-Smoker", "UX Designer"]
    },
    "compatibility": 85,
    "lastMessage": "Saturday at 2pm sounds great!",
    "conversationId": "665f...convo001"
  }
]
```

**Logic:**
1. Find all Match records where `userAId == userId OR userBId == userId`
2. For each match, determine the "other" user
3. Fetch the other user's profile, preference, and last conversation message
4. Generate tags (same algorithm as discovery, max 3)
5. Return sorted by `createdAt` descending

**Note:** `compatibility` is currently hardcoded to `85` in the service. This should be computed dynamically.

---

## 8. Chat Module

### `GET /chat/:matchId`

Open a chat conversation for a specific match. Creates the conversation if it doesn't exist.

**Auth**: Required  
**URL Params:** `matchId` — the Match document ID

**Access Control:** Validates that the authenticated user is a participant in the match (`userAId` or `userBId`).

**Response (200):**
```json
{
  "conversation": {
    "id": "665f...convo001",
    "matchId": "665f...match001",
    "createdAt": "2026-03-20T10:30:00.000Z"
  },
  "messages": [
    {
      "id": "665f...msg001",
      "conversationId": "665f...convo001",
      "senderId": "665f...user001",
      "content": "Hey! I saw your profile!",
      "createdAt": "2026-03-20T10:31:00.000Z"
    }
  ],
  "otherUser": {
    "id": "665f...user002",
    "name": "Sarah Mitchell",
    "picture": "https://...",
    "city": "San Francisco",
    "occupation": "UX Designer"
  }
}
```

**Error Responses:**
- `400` — Missing matchId or userId
- `403` — User is not part of this match
- `404` — Match not found

---

## 9. Socket.IO Events (Real-Time Chat)

### Connection

```javascript
const socket = io("http://localhost:4000");
```

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `join` | `conversationId: string` | Join a conversation room |
| `send_message` | `{ conversationId, senderId, content }` | Send a message |

### Server → Client Events

| Event | Payload | Description |
|---|---|---|
| `new_message` | `{ id, senderId, content, timestamp }` | New message broadcast |

### Message Flow

```
Client A sends:
  socket.emit('send_message', { conversationId, senderId, content })
    → Server receives, persists to DB via prisma.message.create()
    → Server broadcasts: io.to(conversationId).emit('new_message', {...})
    → Client B receives via socket.on('new_message', handler)
```

---

## 10. Error Response Format

All error responses follow this pattern:

```json
{
  "error": "Error type",
  "message": "Human-readable description"
}
```

Or the simpler format used by most modules:

```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes

| Status | Meaning | When Used |
|---|---|---|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid input, missing required fields, weight validation |
| 401 | Unauthorized | Missing/invalid JWT, no userId in request |
| 403 | Forbidden | User not authorized for this resource (e.g., wrong match) |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded (100 req / 15 min) |
| 500 | Internal Server Error | Unhandled server error |

---

## 11. Rate Limiting

```
Window: 15 minutes
Max Requests: 100 per window
Headers: Standard (RateLimit-*)
Response on exceed:
  429 { "error": "Too many requests, please try again later." }
```
