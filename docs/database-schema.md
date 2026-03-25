# Flately — Database Schema & ER Diagram

> **Database**: MongoDB Atlas  
> **ORM**: Prisma ^6.12.0  
> **Database Name**: `flately`

---

## 1. Entity-Relationship Diagram

```
┌──────────────────────┐
│        User          │
│──────────────────────│
│ id        ObjectId   │◄──PK
│ auth0id   String  UQ │     ← Auth0 subject ID (e.g., "auth0|abc123")
│ email     String  UQ │
│ name      String?    │
│ picture   String?    │
│ createdAt DateTime   │
└──────────┬───────────┘
           │ 1:1 (userId FK)
           ▼
┌──────────────────────────┐          ┌──────────────────────────┐
│        Profile           │          │       Preference         │
│──────────────────────────│          │──────────────────────────│
│ id         ObjectId      │◄──PK     │ id           ObjectId    │◄──PK
│ userId     ObjectId   UQ │──FK──┐   │ userId       ObjectId UQ │──FK──┐
│ name       String?       │      │   │ genderPref   String      │      │
│ age        Int?          │      │   │ minBudget    Int         │      │
│ gender     String?       │      │   │ maxBudget    Int         │      │
│ bio        String?       │      │   │ city         String      │      │
│ photos     String[]      │      │   │ cleanliness  Int         │      │
│ city       String?       │      │   │ sleepSchedule Int        │      │
│ hasRoom    Boolean       │      │   │ smoking      Boolean     │      │
│ occupation String?       │      │   │ drinking     Boolean     │      │
│ sleepSchedule String?    │      │   │ pets         Boolean     │      │
│ noiseLevel Int?          │      │   │ socialLevel  Int         │      │
│ guestPolicy String?     │      │   │ weightCleanliness Int    │      │
│ smoking    String?       │      │   │ weightSleep  Int         │      │
│ pets       String?       │      │   │ weightHabits Int         │      │
│ onboardingCompleted Bool │      │   │ weightSocial Int         │      │
│ createdAt  DateTime      │      │   │ createdAt    DateTime    │      │
│ updatedAt  DateTime      │      │   │ updatedAt    DateTime    │      │
└──────────────────────────┘      │   └──────────────────────────┘      │
                                  │                                      │
                User.id ◄─────────┴──────────────────────────────────────┘
                  │
    ┌─────────────┼──────────────┐
    │ fromUserId  │   toUserId   │
    ▼             ▼              ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│         Swipe            │    │         Match            │
│──────────────────────────│    │──────────────────────────│
│ id         ObjectId      │    │ id         ObjectId      │
│ fromUserId ObjectId      │    │ userAId    ObjectId      │──┐
│ toUserId   ObjectId      │    │ userBId    ObjectId      │──┤
│ action     String        │    │ createdAt  DateTime      │  │
│ createdAt  DateTime      │    └────────────┬─────────────┘  │
│ @@unique(from, to)       │                 │ 1:1 (matchId)  │
└──────────────────────────┘                 │                 │
                                             │ @@unique(A, B)  │
                                             ▼                 │
                              ┌──────────────────────────┐     │
                              │     Conversation         │     │
                              │──────────────────────────│     │
                              │ id         ObjectId      │     │
                              │ matchId    ObjectId   UQ │─FK──┘
                              │ createdAt  DateTime      │
                              └────────────┬─────────────┘
                                           │ 1:N
                                           ▼
                              ┌──────────────────────────┐
                              │       Message            │
                              │──────────────────────────│
                              │ id             ObjectId  │
                              │ conversationId ObjectId  │──FK
                              │ senderId       ObjectId  │
                              │ content        String    │
                              │ createdAt      DateTime  │
                              └──────────────────────────┘
```

---

## 2. Complete Prisma Schema

```prisma
// prisma/schema.prisma

datasource db {
    provider = "mongodb"
    url = env("DATABASE_URL")
}

generator client {
    provider = "prisma-client-js"
}

model User {
    id        String   @id @default(auto()) @map("_id") @db.ObjectId
    auth0id   String   @unique
    email     String   @unique
    name      String?
    picture   String?
    createdAt DateTime @default(now())
    profile   Profile?
}

model Profile {
    id        String  @id @default(auto()) @map("_id") @db.ObjectId
    userId    String  @unique @db.ObjectId

    // Basic Info (from onboarding step 1)
    name              String?
    age               Int?
    gender            String?       // 'male' | 'female' | 'other' | 'prefer-not-to-say'
    bio               String?
    photos            String[]      // Array of photo URLs

    // Location & Housing
    city              String?
    hasRoom           Boolean  @default(false)
    occupation        String?       // 'student' | 'professional' | free text

    // Lifestyle (from onboarding step 2-3)
    sleepSchedule     String?       // 'early-bird' | 'night-owl' | 'flexible'
    noiseLevel        Int?          // 1-5 scale
    guestPolicy       String?       // 'never' | 'rarely' | 'sometimes' | 'often'
    smoking           String?       // 'no' | 'outside' | 'yes'
    pets              String?       // 'no' | 'have' | 'love' | 'allergic'

    // Status
    onboardingCompleted Boolean @default(false)

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    user      User     @relation(fields: [userId], references: [id])
}

model Preference {
    id        String @id @default(auto()) @map("_id") @db.ObjectId
    userId    String @unique @db.ObjectId

    // Hard constraints
    genderPreference String    // 'male' | 'female' | 'any'
    minBudget        Int
    maxBudget        Int
    city             String

    // Lifestyle signals (1-5 scale)
    cleanliness      Int
    sleepSchedule    Int
    smoking          Boolean
    drinking         Boolean
    pets             Boolean
    socialLevel      Int

    // Weight configuration (MUST sum to 100)
    weightCleanliness Int
    weightSleep       Int
    weightHabits      Int
    weightSocial      Int

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model Swipe {
    id         String   @id @default(auto()) @map("_id") @db.ObjectId
    fromUserId String   @db.ObjectId
    toUserId   String   @db.ObjectId
    action     String   // "like" | "skip"
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

## 3. Relationships Summary

| Relationship | Type | FK Field | Notes |
|---|---|---|---|
| User → Profile | 1:1 | `Profile.userId` → `User.id` | Prisma relation defined |
| User → Preference | 1:1 | `Preference.userId` | No Prisma relation (implicit via userId) |
| User → Swipe | 1:N | `Swipe.fromUserId` / `Swipe.toUserId` | No Prisma relation (implicit) |
| User → Match | N:M via Match | `Match.userAId`, `Match.userBId` | Sorted: `userAId < userBId` always |
| Match → Conversation | 1:1 | `Conversation.matchId` → `Match.id` | No Prisma relation (implicit) |
| Conversation → Message | 1:N | `Message.conversationId` | Prisma relation defined |

---

## 4. Index & Constraint Details

| Model | Constraint | Type |
|---|---|---|
| User | `auth0id` | Unique |
| User | `email` | Unique |
| Profile | `userId` | Unique (1:1 with User) |
| Preference | `userId` | Unique (1:1 with User) |
| Swipe | `(fromUserId, toUserId)` | Compound unique |
| Match | `(userAId, userBId)` | Compound unique |
| Conversation | `matchId` | Unique (1:1 with Match) |

---

## 5. Match ID Normalization

When creating a Match, user IDs are **sorted alphabetically** to ensure the compound unique constraint works regardless of which user liked first:

```typescript
// matches.service.ts
const userAId = fromUserId < toUserId ? fromUserId : toUserId;
const userBId = fromUserId < toUserId ? toUserId : fromUserId;
```

---

## 6. Field Enumerations

### Profile.gender
`'male'` | `'female'` | `'other'` | `'prefer-not-to-say'`

### Profile.sleepSchedule
`'early-bird'` | `'night-owl'` | `'flexible'`

### Profile.guestPolicy
`'never'` | `'rarely'` | `'sometimes'` | `'often'`

### Profile.smoking
`'no'` | `'outside'` | `'yes'`

### Profile.pets
`'no'` | `'have'` | `'love'` | `'allergic'`

### Profile.occupation (onboarding)
`'student'` | `'professional'`

### Preference.genderPreference
`'male'` | `'female'` | `'any'`

### Swipe.action
`'like'` | `'skip'` (stored as `'like'` / `'dislike'` after normalization)

---

## 7. Seed Data

The seed script (`prisma/seed.ts`) creates **8 demo users** with the prefix `demo_` in their `auth0id`:

| Name | Auth0 ID | City | Occupation | Has Room |
|---|---|---|---|---|
| Sarah Mitchell | demo_sarah_001 | San Francisco | UX Designer | ✅ |
| Alex Chen | demo_alex_002 | San Francisco | Software Engineer | ❌ |
| Jordan Taylor | demo_jordan_003 | San Francisco | Marketing Manager | ✅ |
| Emma Rodriguez | demo_emma_004 | San Francisco | Data Scientist | ❌ |
| Mike Johnson | demo_mike_005 | San Francisco | Freelance Writer | ✅ |
| Lisa Park | demo_lisa_006 | San Francisco | Graphic Designer | ❌ |
| David Kim | demo_david_007 | San Francisco | Product Manager | ✅ |
| Nina Patel | demo_nina_008 | San Francisco | Graduate Student | ❌ |

**Seed also creates:**
- 3 mutual matches (Sarah↔Alex, Jordan↔Emma, Mike↔Lisa) with conversations and messages
- 3 pending one-way swipes (David→Sarah, Nina→Sarah, David→Jordan)

```bash
npm run seed         # Create demo data
npm run seed:reset   # Remove all demo data (WHERE auth0id STARTS WITH "demo_")
```
