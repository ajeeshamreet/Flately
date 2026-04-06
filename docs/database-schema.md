# Flately - Database Schema & ER Diagram

> Database: MongoDB Atlas
> ORM: Prisma ^6.19.2
> Database name: flately
> Last updated: 2026-04-06

---

## 1. Entity-Relationship Diagram

```text
┌───────────────────────────────────┐
│               User                │
│───────────────────────────────────│
│ id           ObjectId   PK        │
│ email        String     UQ        │
│ passwordHash String?              │
│ googleId     String?              │
│ name         String?              │
│ picture      String?              │
│ createdAt    DateTime             │
│ updatedAt    DateTime             │
└──────────────┬────────────────────┘
               │ 1:1
               │ Profile.userId (UQ)
               ▼
┌───────────────────────────────────┐
│              Profile              │
│───────────────────────────────────│
│ id                  ObjectId PK   │
│ userId              ObjectId UQ   │
│ name                String?       │
│ age                 Int?          │
│ gender              String?       │
│ bio                 String?       │
│ photos              String[]      │
│ city                String?       │
│ hasRoom             Boolean       │
│ occupation          String?       │
│ sleepSchedule       String?       │
│ noiseLevel          Int?          │
│ guestPolicy         String?       │
│ smoking             String?       │
│ pets                String?       │
│ onboardingCompleted Boolean       │
│ createdAt           DateTime      │
│ updatedAt           DateTime      │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│            Preference             │
│───────────────────────────────────│
│ id                 ObjectId PK    │
│ userId             ObjectId UQ    │
│ genderPreference   String         │
│ minBudget          Int            │
│ maxBudget          Int            │
│ city               String         │
│ cleanliness        Int            │
│ sleepSchedule      Int            │
│ smoking            Boolean        │
│ drinking           Boolean        │
│ pets               Boolean        │
│ socialLevel        Int            │
│ weightCleanliness  Int            │
│ weightSleep        Int            │
│ weightHabits       Int            │
│ weightSocial       Int            │
│ createdAt          DateTime       │
│ updatedAt          DateTime       │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│              Swipe                │
│───────────────────────────────────│
│ id         ObjectId PK            │
│ fromUserId ObjectId               │
│ toUserId   ObjectId               │
│ action     String                 │
│ createdAt  DateTime               │
│ UQ(fromUserId, toUserId)          │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│              Match                │
│───────────────────────────────────│
│ id        ObjectId PK             │
│ userAId   ObjectId                │
│ userBId   ObjectId                │
│ createdAt DateTime                │
│ UQ(userAId, userBId)              │
└──────────────────┬────────────────┘
                   │ 1:1
                   │ Conversation.matchId (UQ)
                   ▼
┌───────────────────────────────────┐
│           Conversation            │
│───────────────────────────────────│
│ id        ObjectId PK             │
│ matchId   ObjectId UQ             │
│ createdAt DateTime                │
└──────────────────┬────────────────┘
                   │ 1:N
                   ▼
┌───────────────────────────────────┐
│              Message              │
│───────────────────────────────────│
│ id             ObjectId PK        │
│ conversationId ObjectId           │
│ senderId       ObjectId           │
│ content        String             │
│ createdAt      DateTime           │
└───────────────────────────────────┘
```

---

## 2. Current Prisma Schema (Source-Aligned)

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  email        String   @unique
  passwordHash String?
  googleId     String?
  name         String?
  picture      String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  profile      Profile?
}

model Profile {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId
  userId              String   @unique @db.ObjectId
  name                String?
  age                 Int?
  gender              String?
  bio                 String?
  photos              String[]
  city                String?
  hasRoom             Boolean  @default(false)
  occupation          String?
  sleepSchedule       String?
  noiseLevel          Int?
  guestPolicy         String?
  smoking             String?
  pets                String?
  onboardingCompleted Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user                User     @relation(fields: [userId], references: [id])
}

model Preference {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  userId            String   @unique @db.ObjectId
  genderPreference  String
  minBudget         Int
  maxBudget         Int
  city              String
  cleanliness       Int
  sleepSchedule     Int
  smoking           Boolean
  drinking          Boolean
  pets              Boolean
  socialLevel       Int
  weightCleanliness Int
  weightSleep       Int
  weightHabits      Int
  weightSocial      Int
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Swipe {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  fromUserId String   @db.ObjectId
  toUserId   String   @db.ObjectId
  action     String
  createdAt  DateTime @default(now())

  @@unique([fromUserId, toUserId])
}

model Match {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userAId   String   @db.ObjectId
  userBId   String   @db.ObjectId
  createdAt DateTime @default(now())

  @@unique([userAId, userBId])
}

model Conversation {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  matchId   String    @unique @db.ObjectId
  createdAt DateTime  @default(now())
  messages  Message[]
}

model Message {
  id             String       @id @default(auto()) @map("_id") @db.ObjectId
  conversationId String       @db.ObjectId
  senderId       String       @db.ObjectId
  content        String
  createdAt      DateTime     @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id])
}
```

---

## 3. Relationship Summary

| Relationship | Type | FK Field | Notes |
|---|---|---|---|
| User -> Profile | 1:1 | Profile.userId -> User.id | Prisma relation is explicit |
| User -> Preference | 1:1 | Preference.userId -> User.id | Referential link is implicit by id |
| User -> Swipe | 1:N | Swipe.fromUserId / Swipe.toUserId | Logical relation only |
| User -> Match | N:M via Match | Match.userAId / Match.userBId | Stored as canonical ordered pair |
| Match -> Conversation | 1:1 | Conversation.matchId -> Match.id | Enforced by unique matchId |
| Conversation -> Message | 1:N | Message.conversationId -> Conversation.id | Prisma relation is explicit |

---

## 4. Indexes & Constraints

| Model | Constraint | Type |
|---|---|---|
| User | email | Unique |
| Profile | userId | Unique |
| Preference | userId | Unique |
| Swipe | (fromUserId, toUserId) | Compound unique |
| Match | (userAId, userBId) | Compound unique |
| Conversation | matchId | Unique |

Notes:
- googleId is nullable and currently not declared unique at schema level.
- Account identity is anchored on unique email for email/password and Google linking logic.

---

## 5. Authentication Data Model Notes

- Email/password accounts store passwordHash and may have googleId as null.
- Google OAuth accounts store googleId; passwordHash may remain null.
- Linking behavior resolves users by googleId first, then by email when appropriate.

---

## 6. Swipe Action Canonical Behavior

Runtime behavior in discovery flow:

- Accepted request actions: like, dislike, skip, superlike
- Stored action normalization:
  - superlike -> like
  - skip -> dislike

This normalization is implemented in backend/src/modules/discovery/discovery.service.ts.

---

## 7. Match Pair Normalization

When creating a match, user ids are sorted so the compound unique key is stable regardless of swipe direction:

```typescript
const userAId = fromUserId < toUserId ? fromUserId : toUserId;
const userBId = fromUserId < toUserId ? toUserId : fromUserId;
```

---

## 8. Seed Data (Current)

Canonical dataset source:
- `backend/seed/flately_dataset.json`

Current dataset footprint:
- 16 users
- 16 profiles
- 16 preferences
- 20 swipes
- 6 matches
- 4 conversations
- 15 messages

Seed pipeline behavior:
- Validates cross-record references before writes (users/profiles/preferences/swipes/matches/conversations/messages)
- Maps fake JSON ObjectIds to real DB-generated ObjectIds during insert/upsert
- Supports idempotent upsert and optional full reset

Commands:

```bash
npm run seed         # Idempotent upsert seed flow
npm run seed -- --dry-run   # Validate dataset only, no DB writes
npm run seed:reset   # Delete seeded collections then reseed
```
