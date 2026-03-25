# Flately — API Reference

All endpoints require JWT authentication via Auth0 unless noted.

**Base URL:** `http://localhost:4000`  
**Auth Header:** `Authorization: Bearer <auth0_token>`

---

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Server health check |

**Response:** `{ "status": "ok" }`

---

## Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/sync` | Sync Auth0 user to database |
| GET | `/users/me` | Get current user |

---

## Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles/me` | Get authenticated user's profile |
| POST | `/profiles` | Create profile |
| PUT | `/profiles/me` | Update profile |

### POST `/profiles`

```json
{
  "age": 26,
  "gender": "female",
  "occupation": "UX Designer",
  "city": "San Francisco",
  "hasRoom": true
}
```

---

## Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/preferences/me` | Get user preferences |
| POST | `/preferences` | Create preferences |
| PUT | `/preferences/me` | Update preferences |

### POST `/preferences`

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

---

## Discovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/discovery/feed` | Get swipeable profiles with compatibility scores |
| POST | `/discovery/swipe` | Submit swipe action |

### POST `/discovery/swipe`

```json
{ "toUserId": "string", "action": "like" | "skip" }
```

### GET `/discovery/feed` Response

```json
[
  {
    "id": "userId",
    "name": "Sarah Mitchell",
    "age": 26,
    "gender": "female",
    "occupation": "UX Designer",
    "city": "San Francisco",
    "hasRoom": true,
    "photos": ["https://..."],
    "compatibility": 85,
    "budgetMin": 1200,
    "budgetMax": 2000,
    "tags": ["Has Room", "Non-Smoker", "Clean & Tidy"]
  }
]
```

---

## Matches

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/matches/me` | Get all matches for authenticated user |

### Response

```json
[
  {
    "id": "matchId",
    "matchedAt": "2026-02-03T...",
    "otherUser": { "id": "userId", "name": "Alex Chen", "age": 28, "photos": [], "city": "San Francisco", "tags": [] },
    "compatibility": 85,
    "lastMessage": "Hey!",
    "conversationId": "convoId"
  }
]
```

---

## Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/:matchId` | Get conversation & messages |

### Socket.io Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join` | Client → Server | `conversationId: string` | Join a conversation room |
| `send_message` | Client → Server | `{ conversationId, senderId, content }` | Send a message |
| `new_message` | Server → Client | `Message` object | Broadcast new message |

---

## Matching

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/matching/compatible` | Get compatible users with scores |

### Compatibility Algorithm

1. **Hard constraints**: Same city, budget overlap, gender preference match
2. **Soft scoring** (0–100): Weighted combination of cleanliness, sleep schedule, habits (smoking/drinking), and social level similarity

---

## Error Responses

All errors follow this format:

```json
{ "error": "Error description" }
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Resource not found |
| 429 | Rate limited (100 req / 15 min) |
| 500 | Internal server error |
