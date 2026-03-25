# Flately — Matching Algorithm Deep Dive

> **File**: `backend/src/modules/matching/matching.service.ts`  
> **Purpose**: Compute compatibility scores between users based on weighted lifestyle preferences

---

## 1. Algorithm Overview

The matching algorithm has two phases:

```
Phase 1: ELIGIBILITY FILTER (hard constraints — binary pass/fail)
    ↓ (eligible candidates only)
Phase 2: COMPATIBILITY SCORING (weighted similarity — 0–100 score)
    ↓ (sorted by score descending)
Output: Array<{ userId: string, score: number }>
```

---

## 2. Phase 1 — Eligibility Filter

A candidate is **eligible** only if ALL of the following conditions pass:

```typescript
function isEligible(userA: CandidateShape, userB: CandidateShape): boolean {
  // 1. Not self
  if (userA.userId === userB.userId) return false;

  // 2. Same city
  if (userA.city !== userB.city) return false;

  // 3. Budget overlap — A's max must be >= B's min AND vice versa
  if (userA.maxBudget < userB.minBudget || userB.maxBudget < userA.minBudget)
    return false;

  // 4. Gender preference mutual compatibility
  if (userA.genderPreference !== 'any' && userA.genderPreference !== userB.gender)
    return false;
  if (userB.genderPreference !== 'any' && userB.genderPreference !== userA.gender)
    return false;

  return true;
}
```

### Hard Constraint Summary

| Constraint | Rule | Example |
|---|---|---|
| Self-exclusion | Cannot match with self | Always filtered |
| City | Must be exact string match | "San Francisco" ≠ "SF" |
| Budget | Ranges must overlap | A[$1000-$1500] overlaps B[$1200-$2000] ✅ |
| Gender Preference | Both users' preferences must accept each other | A wants "female", B is "male" ❌ |

**⚠️ Current limitation:** City matching is **exact string match**, not fuzzy or distance-based.

---

## 3. Phase 2 — Compatibility Scoring

For each eligible candidate, a **weighted compatibility score** is computed.

### Similarity Functions

```typescript
// Numeric similarity: 1 = identical, 0 = maximally different
function similarityScore(a: number, b: number, max = 5): number {
  return 1 - Math.abs(a - b) / max;
}

// Boolean similarity: 1 = same, 0 = different
function booleanScore(a: boolean, b: boolean): number {
  return a === b ? 1 : 0;
}
```

### Score Calculation

```typescript
function calculateScore(prefA: PreferenceShape, prefB: PreferenceShape): number {
  // Cleanliness dimension (1-5 scale)
  const cleanliness = similarityScore(prefA.cleanliness, prefB.cleanliness)
                      * prefA.weightCleanliness;

  // Sleep schedule dimension (1-5 scale)
  const sleep = similarityScore(prefA.sleepSchedule, prefB.sleepSchedule)
                * prefA.weightSleep;

  // Habits dimension (average of smoking + drinking boolean scores)
  const habits = (
    (booleanScore(prefA.smoking, prefB.smoking) +
     booleanScore(prefA.drinking, prefB.drinking)) / 2
  ) * prefA.weightHabits;

  // Social level dimension (1-5 scale)
  const social = similarityScore(prefA.socialLevel, prefB.socialLevel)
                 * prefA.weightSocial;

  return Math.round(cleanliness + sleep + habits + social);
}
```

### Score Breakdown

| Dimension | Input Type | Similarity Method | Weight Source |
|---|---|---|---|
| Cleanliness | `Int (1-5)` | `1 - \|a-b\| / 5` | `prefA.weightCleanliness` |
| Sleep Schedule | `Int (1-5)` | `1 - \|a-b\| / 5` | `prefA.weightSleep` |
| Habits | `2 × Boolean` | `avg(smoking_match, drinking_match)` | `prefA.weightHabits` |
| Social Level | `Int (1-5)` | `1 - \|a-b\| / 5` | `prefA.weightSocial` |

### Score Range

- **Maximum possible score**: `100` (when all dimensions are perfectly matched)
  - All weights sum to 100
  - All similarity scores = 1.0
  - Score = 25 + 25 + 25 + 25 = 100 (default weights)
- **Minimum possible score**: `0` (maximally different on all dimensions)

---

## 4. Worked Example

### User A's Preferences
```
cleanliness: 4, sleepSchedule: 2, smoking: false, drinking: true, socialLevel: 4
weightCleanliness: 30, weightSleep: 25, weightHabits: 20, weightSocial: 25
```

### User B's Preferences
```
cleanliness: 5, sleepSchedule: 3, smoking: false, drinking: true, socialLevel: 3
```

### Calculation

```
Cleanliness:  similarityScore(4, 5)    = 1 - |4-5|/5 = 1 - 0.2  = 0.8  × 30 = 24.0
Sleep:        similarityScore(2, 3)    = 1 - |2-3|/5 = 1 - 0.2  = 0.8  × 25 = 20.0
Habits:       (boolScore(F,F) + boolScore(T,T)) / 2 = (1 + 1)/2 = 1.0  × 20 = 20.0
Social:       similarityScore(4, 3)    = 1 - |4-3|/5 = 1 - 0.2  = 0.8  × 25 = 20.0
                                                                          ─────
Total (rounded):                                                            84
```

**Result**: User A rates User B at **84% compatibility**.

---

## 5. Important Notes

### Asymmetric Scoring

The score is calculated **from User A's perspective** using User A's weights. The reverse calculation (B scores A) may produce a **different score** because B may have different weights.

```
Score(A → B) ≠ Score(B → A)   (unless both have identical weights)
```

### Weight Validation

Weights are validated on save in `preferences.service.ts`:

```typescript
function validateWeights(weights: Weights): boolean {
  const total = weights.weightCleanliness + weights.weightSleep
              + weights.weightHabits + weights.weightSocial;
  return total === 100;
}
```

If `total !== 100`, the API returns `400 { error: "Weights must sum to 100" }`.

---

## 6. Discovery Feed Pipeline

The discovery feed combines matching + filtering:

```typescript
// discovery.service.ts
export async function getDiscoveryFeed(userId: string) {
  // 1. Get all users this user has already swiped on
  const swipes = await prisma.swipe.findMany({
    where: { fromUserId: userId },
    select: { toUserId: true },
  });
  const excludedUserIds = swipes.map(s => s.toUserId);

  // 2. Run matching algorithm for ALL candidates
  const matches = await findMatchesForUser(userId);

  // 3. Remove already-swiped users
  const filtered = matches.filter(m => !excludedUserIds.includes(m.userId));

  // 4. Enrich each candidate with full profile + preference data + tags
  const enrichedProfiles = await Promise.all(
    filtered.map(async (match) => {
      const profile = await prisma.profile.findUnique({ ... });
      const preference = await prisma.preference.findUnique({ ... });
      return {
        id: match.userId,
        name: profile.user?.name || 'Anonymous',
        compatibility: match.score,
        tags: generateTags(profile, preference),
        // ... other fields
      };
    })
  );

  return enrichedProfiles.filter(Boolean);
}
```

---

## 7. Mutual Match Detection (Swipe → Match)

```typescript
// matches.service.ts
export async function checkAndCreateMatch(fromUserId, toUserId) {
  // 1. Check if toUser has already liked fromUser
  const reverseSwipe = await prisma.swipe.findUnique({
    where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId } }
  });

  // 2. If no reverse swipe or not a "like" → no match
  if (!reverseSwipe || reverseSwipe.action !== 'like')
    return { matched: false };

  // 3. MUTUAL LIKE! Create Match with sorted IDs
  const userAId = fromUserId < toUserId ? fromUserId : toUserId;
  const userBId = fromUserId < toUserId ? toUserId : fromUserId;

  const match = await prisma.match.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    update: {},
    create: { userAId, userBId },
  });

  return { matched: true, match };
}
```

### Flow Diagram

```
User A swipes "like" on User B
    │
    ├── Check: Has User B already liked User A?
    │     │
    │     ├── NO  → Save swipe only, return { matched: false }
    │     │
    │     └── YES → Create Match (sorted IDs) + return { matched: true }
    │
    └── If action was "skip"/"dislike" → Save swipe only, no match check
```
