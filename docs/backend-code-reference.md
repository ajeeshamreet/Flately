# Flately — Backend Module Reference (Complete Code)

> This document contains complete, annotated source code for every backend module.  
> An LLM can reproduce the exact same backend by following this document.

---

## 1. Entry Point — `server.ts`

```typescript
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import registerChatSocket from './modules/chat/chat.socket';
import { ClientToServerEvents, ServerToClientEvents } from './types/socket';

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: '*' },
});

registerChatSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server + Socket running on port ${PORT}`);
});
```

---

## 2. Express App — `app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import env from './config/env';

import profileRoutes from './modules/profiles/profiles.routes';
import preferenceRoutes from './modules/preferences/preferences.routes';
import userRoutes from './modules/users.routes';
import matchingRoutes from './modules/matching/matching.routes';
import matchRoutes from './modules/matches/matches.routes';
import discoveryRoutes from './modules/discovery/discovery.routes';
import chatRoutes from './modules/chat/chat.routes';

const app = express();
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json());
app.use('/matching', matchingRoutes);
app.use('/profiles', profileRoutes);
app.use('/discovery', discoveryRoutes);
app.use('/users', userRoutes);
app.use('/matches', matchRoutes);
app.use('/chat', chatRoutes);
app.use('/preferences', preferenceRoutes);
app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });

export default app;
```

---

## 3. Configuration

### `config/env.ts`

```typescript
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH0_DOMAIN: z.string().min(1, 'AUTH0_DOMAIN is required'),
  AUTH0_AUDIENCE: z.string().min(1, 'AUTH0_AUDIENCE is required'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const env = parsed.data;
export type EnvConfig = z.infer<typeof envSchema>;
export default env;
```

### `config/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default prisma;
```

---

## 4. Auth Middleware — `middlewares/auth0.middleware.ts`

```typescript
import { auth } from 'express-oauth2-jwt-bearer';
import { NextFunction, Request, Response, RequestHandler } from 'express';
import { AuthRequest } from '../types/auth';

const checkJwt: RequestHandler = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
});

const attachUserId = (req: Request, _res: Response, next: NextFunction): void => {
  const authReq = req as AuthRequest;
  if (authReq.auth?.payload?.sub) {
    authReq.userId = authReq.auth.payload.sub;
  }
  next();
};

export default [checkJwt, attachUserId] as RequestHandler[];
```

---

## 5. Type Definitions

### `types/auth.ts`

```typescript
import { Request } from 'express';

export interface Auth0User {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export type AuthRequest = Request & {
  user?: Auth0User;
  userId?: string;
  auth?: {
    payload?: {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };
  };
};
```

### `types/api.ts`

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
```

### `types/socket.ts`

```typescript
export interface ServerToClientEvents {
  message: (data: MessagePayload) => void;
  userOnline: (userId: string) => void;
  userOffline: (userId: string) => void;
  new_message: (data: MessagePayload) => void;
}

export interface ClientToServerEvents {
  sendMessage: (data: SendMessagePayload) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  send_message: (data: SendMessagePayload) => void;
  join: (conversationId: string) => void;
}

export interface MessagePayload {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content: string;
}
```

---

## 6. Users Module

### `modules/users.routes.ts`

```typescript
import { RequestHandler, Router } from 'express';
import checkJwt from '../middlewares/auth0.middleware';
import { getUserProfile } from './users.controllers';

const router = Router();
router.get('/me', checkJwt, getUserProfile as RequestHandler);
export default router;
```

### `modules/users.controllers.ts`

```typescript
import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { getOrCreateUser } from './users.service';

export async function getUserProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const payload = req.auth?.payload;
    if (!payload?.sub) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const user = await getOrCreateUser({
      auth0Id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });
    res.json(user);
  } catch (error: unknown) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

### `modules/users.service.ts`

```typescript
import prisma from '../config/prisma';

interface Auth0ProfileInput {
  auth0Id: string;
  email?: string;
  name?: string;
  picture?: string;
}

export async function getOrCreateUser(data: Auth0ProfileInput) {
  let user = await prisma.user.findUnique({ where: { auth0id: data.auth0Id } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        auth0id: data.auth0Id,
        email: data.email ?? '',
        name: data.name ?? '',
        picture: data.picture ?? '',
      },
    });
  }
  return user;
}
```

---

## 7. Profiles Module

### `modules/profiles/profiles.routes.ts`

```typescript
import { RequestHandler, Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { getMyProfile, saveProfile } from './profiles.controller';

const router = Router();
router.get('/me', checkJwt, getMyProfile as RequestHandler);
router.post('/me', checkJwt, saveProfile as RequestHandler);
export default router;
```

### `modules/profiles/profiles.controller.ts`

```typescript
import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { createOrUpdateProfile, getProfileByUserId } from './profiles.service';

export async function getMyProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ message: 'Unauthorized' }); return; }
  try {
    const profile = await getProfileByUserId(userId);
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function saveProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ message: 'Unauthorized' }); return; }
  try {
    const body = req.body as Record<string, unknown>;
    const profileData = {
      name: body.name as string | undefined,
      age: body.age as number | undefined,
      gender: body.gender as string | undefined,
      bio: body.bio as string | undefined,
      photos: body.photos as string[] | undefined,
      city: body.city as string | undefined,
      hasRoom: body.hasRoom as boolean | undefined,
      occupation: body.occupation as string | undefined,
      sleepSchedule: body.sleepSchedule as string | undefined,
      noiseLevel: body.noiseLevel as number | undefined,
      guestPolicy: body.guestPolicy as string | undefined,
      smoking: body.smoking as string | undefined,
      pets: body.pets as string | undefined,
      onboardingCompleted: true,
    };
    const cleanedData = Object.fromEntries(
      Object.entries(profileData).filter(([_, v]) => v !== undefined)
    );
    const profile = await createOrUpdateProfile(userId, cleanedData);
    res.json(profile);
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
```

### `modules/profiles/profiles.service.ts`

```typescript
import prisma from '../../config/prisma';

type ProfileUpdateData = Parameters<typeof prisma.profile.update>[0]['data'];

export async function getProfileByUserId(userId: string) {
  return prisma.profile.findUnique({ where: { userId } });
}

export async function createOrUpdateProfile(userId: string, data: ProfileUpdateData) {
  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (existing) {
    return prisma.profile.update({ where: { userId }, data });
  }
  return prisma.profile.create({
    data: {
      ...(data as Record<string, unknown>),
      userId,
    } as Parameters<typeof prisma.profile.create>[0]['data'],
  });
}
```

---

## 8. Preferences Module

### `modules/preferences/preferences.routes.ts`

```typescript
import { RequestHandler, Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { getMyPreferences, saveMyPreferences } from './preferences.controller';

const router = Router();
router.get('/me', checkJwt, getMyPreferences as RequestHandler);
router.post('/me', checkJwt, saveMyPreferences as RequestHandler);
export default router;
```

### `modules/preferences/preferences.controller.ts`

```typescript
import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { getPreferences, savePreferences } from './preferences.service';

export async function getMyPreferences(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ message: 'Unauthorized' }); return; }
  const prefs = await getPreferences(userId);
  res.json(prefs);
}

export async function saveMyPreferences(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ message: 'Unauthorized' }); return; }
  try {
    const prefs = await savePreferences(userId, req.body as Parameters<typeof savePreferences>[1]);
    res.json(prefs);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INVALID_WEIGHTS') {
      res.status(400).json({ error: 'Weights must sum to 100' });
      return;
    }
    res.status(500).json({ message: 'Failed to save preferences' });
  }
}
```

### `modules/preferences/preferences.service.ts`

```typescript
import prisma from '../../config/prisma';

type PreferenceData = Parameters<typeof prisma.preference.update>[0]['data'];

interface Weights {
  weightCleanliness: number;
  weightSleep: number;
  weightHabits: number;
  weightSocial: number;
}

function isWeights(value: unknown): value is Weights {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.weightCleanliness === 'number' &&
    typeof candidate.weightSleep === 'number' &&
    typeof candidate.weightHabits === 'number' &&
    typeof candidate.weightSocial === 'number'
  );
}

function validateWeights(weights: unknown): boolean {
  if (!isWeights(weights)) return false;
  const total = weights.weightCleanliness + weights.weightSleep
              + weights.weightHabits + weights.weightSocial;
  return total === 100;
}

export async function getPreferences(userId: string) {
  return prisma.preference.findUnique({ where: { userId } });
}

export async function savePreferences(userId: string, data: PreferenceData) {
  if (!validateWeights(data)) throw new Error('INVALID_WEIGHTS');
  const existing = await prisma.preference.findUnique({ where: { userId } });
  if (existing) {
    return prisma.preference.update({ where: { userId }, data });
  }
  return prisma.preference.create({
    data: {
      ...(data as Record<string, unknown>),
      userId,
    } as Parameters<typeof prisma.preference.create>[0]['data'],
  });
}
```

---

## 9. Matching Module

### `modules/matching/matching.routes.ts`

```typescript
import { Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { getMatches } from './matching.controller';

const router = Router();
router.get('/me', checkJwt, getMatches);
export default router;
```

### `modules/matching/matching.controller.ts`

```typescript
import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { findMatches } from './matching.service';

export async function getMatches(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ message: 'Unauthorized' }); return; }
  try {
    const matches = await findMatches(userId);
    res.json(matches);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'PROFILE_OR_PREFERENCES_MISSING') {
      res.status(400).json({ message: 'Complete profile and preferences first' });
      return;
    }
    res.status(500).json({ message: 'Matching failed' });
  }
}
```

### `modules/matching/matching.service.ts`

```typescript
import prisma from '../../config/prisma';

interface CandidateShape {
  userId: string; city: string; minBudget: number; maxBudget: number;
  genderPreference: string; gender: string;
}

interface PreferenceShape {
  cleanliness: number; sleepSchedule: number; smoking: boolean;
  drinking: boolean; socialLevel: number;
  weightCleanliness: number; weightSleep: number; weightHabits: number; weightSocial: number;
}

function isEligible(userA: CandidateShape, userB: CandidateShape): boolean {
  if (userA.userId === userB.userId) return false;
  if (userA.city !== userB.city) return false;
  if (userA.maxBudget < userB.minBudget || userB.maxBudget < userA.minBudget) return false;
  if (userA.genderPreference !== 'any' && userA.genderPreference !== userB.gender) return false;
  if (userB.genderPreference !== 'any' && userB.genderPreference !== userA.gender) return false;
  return true;
}

function similarityScore(a: number, b: number, max = 5): number {
  return 1 - Math.abs(a - b) / max;
}

function booleanScore(a: boolean, b: boolean): number {
  return a === b ? 1 : 0;
}

function calculateScore(prefA: PreferenceShape, prefB: PreferenceShape): number {
  const cleanliness = similarityScore(prefA.cleanliness, prefB.cleanliness) * prefA.weightCleanliness;
  const sleep = similarityScore(prefA.sleepSchedule, prefB.sleepSchedule) * prefA.weightSleep;
  const habits = ((booleanScore(prefA.smoking, prefB.smoking) +
    booleanScore(prefA.drinking, prefB.drinking)) / 2) * prefA.weightHabits;
  const social = similarityScore(prefA.socialLevel, prefB.socialLevel) * prefA.weightSocial;
  return Math.round(cleanliness + sleep + habits + social);
}

export async function findMatchesForUser(userId: string) {
  const userProfile = await prisma.profile.findUnique({ where: { userId } });
  const userPref = await prisma.preference.findUnique({ where: { userId } });
  if (!userProfile || !userPref) throw new Error('PROFILE_OR_PREFERENCES_MISSING');

  const candidates = await prisma.profile.findMany({
    where: { userId: { not: userId } }, include: { user: true },
  });
  const candidatePrefs = await prisma.preference.findMany();
  const results: Array<{ userId: string; score: number }> = [];

  for (const candidate of candidates) {
    const candidatePref = candidatePrefs.find((p) => p.userId === candidate.userId);
    if (!candidatePref) continue;

    const eligible = isEligible(
      { ...(userProfile as unknown as CandidateShape), ...(userPref as unknown as CandidateShape) },
      { ...(candidate as unknown as CandidateShape), ...(candidatePref as unknown as CandidateShape) },
    );
    if (!eligible) continue;

    const score = calculateScore(
      userPref as unknown as PreferenceShape,
      candidatePref as unknown as PreferenceShape,
    );
    results.push({ userId: candidate.userId, score });
  }
  return results.sort((a, b) => b.score - a.score);
}

export const findMatches = findMatchesForUser;
```

---

## 10. Discovery Module

### `modules/discovery/discovery.routes.ts`

```typescript
import { RequestHandler, Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { getFeed, swipe } from './discovery.controller';

const router = Router();
router.get('/feed', checkJwt, getFeed as RequestHandler);
router.post('/swipe', checkJwt, swipe as RequestHandler);
export default router;
```

### `modules/discovery/discovery.controller.ts`

```typescript
import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { getDiscoveryFeed, swipeUser } from './discovery.service';

function isSwipeAction(value: unknown): value is 'like' | 'dislike' {
  return value === 'like' || value === 'dislike' || value === 'skip' || value === 'superlike';
}

export async function getFeed(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ message: 'Unauthorized' }); return; }
  const feed = await getDiscoveryFeed(userId);
  res.json(feed);
}

export async function swipe(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ message: 'Unauthorized' }); return; }
  const body = req.body as Record<string, unknown>;
  const toUserId = body.toUserId;
  const action = body.action;
  if (typeof toUserId !== 'string' || !isSwipeAction(action)) {
    res.status(400).json({ error: 'Invalid action' }); return;
  }
  await swipeUser(userId, toUserId, action);
  res.json({ success: true });
}
```

### `modules/discovery/discovery.service.ts`

```typescript
import prisma from '../../config/prisma';
import { checkAndCreateMatch } from '../matches/matches.service';
import { findMatchesForUser } from '../matching/matching.service';

export async function getDiscoveryFeed(userId: string) {
  const swipes = await prisma.swipe.findMany({
    where: { fromUserId: userId }, select: { toUserId: true },
  });
  const excludedUserIds = swipes.map((s) => s.toUserId);
  const matches = await findMatchesForUser(userId);
  const filtered = matches.filter((m) => !excludedUserIds.includes(m.userId));

  const enrichedProfiles = await Promise.all(
    filtered.map(async (match) => {
      const profile = await prisma.profile.findUnique({
        where: { userId: match.userId }, include: { user: true },
      });
      const preference = await prisma.preference.findUnique({
        where: { userId: match.userId },
      });
      if (!profile) return null;
      return {
        id: match.userId,
        name: profile.user?.name || 'Anonymous',
        age: profile.age, gender: profile.gender, occupation: profile.occupation,
        city: profile.city, hasRoom: profile.hasRoom,
        photos: profile.user?.picture ? [profile.user.picture] : [],
        compatibility: match.score,
        budgetMin: preference?.minBudget || 0,
        budgetMax: preference?.maxBudget || 0,
        tags: generateTags(profile, preference),
      };
    }),
  );
  return enrichedProfiles.filter(Boolean);
}

function generateTags(profile, preference) {
  const tags: string[] = [];
  if (profile.hasRoom) tags.push('Has Room');
  if (preference?.pets) tags.push('Pet Friendly');
  if (!preference?.smoking) tags.push('Non-Smoker');
  if ((preference?.cleanliness ?? 0) >= 4) tags.push('Clean & Tidy');
  if ((preference?.socialLevel ?? 0) >= 4) tags.push('Social');
  if ((preference?.socialLevel ?? 0) <= 2) tags.push('Quiet');
  if ((preference?.sleepSchedule ?? 0) <= 2) tags.push('Early Bird');
  if ((preference?.sleepSchedule ?? 0) >= 4) tags.push('Night Owl');
  if (profile.occupation) tags.push(profile.occupation);
  return tags.slice(0, 4);
}

export async function swipeUser(fromUserId: string, toUserId: string, action: string) {
  const normalizedAction = action === 'superlike' ? 'like' : action === 'skip' ? 'dislike' : action;
  const swipe = await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId, toUserId } },
    update: { action: normalizedAction },
    create: { fromUserId, toUserId, action: normalizedAction },
  });
  let matched = false;
  if (normalizedAction === 'like') {
    const result = await checkAndCreateMatch(fromUserId, toUserId);
    matched = result?.matched || false;
  }
  return { swipe, matched };
}
```

---

## 11. Matches Module

### `modules/matches/matches.routes.ts`

```typescript
import { Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { getMyMatches } from './matches.controller';

const router = Router();
router.get('/me', checkJwt, getMyMatches);
export default router;
```

### `modules/matches/matches.controller.ts`

```typescript
import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { getMyMatches as getMyMatchesService } from './matches.service';

export async function getMyMatches(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) { res.status(401).json({ message: 'Unauthorized' }); return; }
  const matches = await getMyMatchesService(userId);
  res.json(matches);
}
```

### `modules/matches/matches.service.ts`

```typescript
import prisma from '../../config/prisma';

export async function checkAndCreateMatch(fromUserId: string, toUserId: string) {
  const reverseSwipe = await prisma.swipe.findUnique({
    where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId } },
  });
  if (!reverseSwipe || reverseSwipe.action !== 'like') return { matched: false };

  const userAId = fromUserId < toUserId ? fromUserId : toUserId;
  const userBId = fromUserId < toUserId ? toUserId : fromUserId;

  const match = await prisma.match.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    update: {},
    create: { userAId, userBId },
  });
  return { matched: true, match };
}

function generateMatchTags(profile, preference) {
  const tags: string[] = [];
  if (profile?.hasRoom) tags.push('Has Room');
  if (preference?.pets) tags.push('Pet Friendly');
  if (!preference?.smoking) tags.push('Non-Smoker');
  if (profile?.occupation) tags.push(profile.occupation);
  return tags.slice(0, 3);
}

export async function getMyMatches(userId: string) {
  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: { createdAt: 'desc' },
  });

  const enrichedMatches = await Promise.all(
    matches.map(async (match) => {
      const otherUserId = match.userAId === userId ? match.userBId : match.userAId;
      const profile = await prisma.profile.findUnique({
        where: { userId: otherUserId }, include: { user: true },
      });
      const preference = await prisma.preference.findUnique({
        where: { userId: otherUserId },
      });
      const conversation = await prisma.conversation.findUnique({
        where: { matchId: match.id },
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      });
      return {
        id: match.id,
        matchedAt: match.createdAt,
        createdAt: match.createdAt,
        otherUser: profile ? {
          id: otherUserId,
          name: profile.user?.name || 'Anonymous',
          age: profile.age, gender: profile.gender, occupation: profile.occupation,
          city: profile.city, hasRoom: profile.hasRoom,
          photos: profile.user?.picture ? [profile.user.picture] : [],
          budgetMin: preference?.minBudget || 0,
          budgetMax: preference?.maxBudget || 0,
          tags: generateMatchTags(profile, preference),
        } : null,
        compatibility: 85,
        lastMessage: conversation?.messages[0]?.content || null,
        conversationId: conversation?.id || null,
      };
    }),
  );
  return enrichedMatches.filter((m) => m.otherUser !== null);
}
```

---

## 12. Chat Module

### `modules/chat/chat.routes.ts`

```typescript
import { Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { Openchat } from './chat.controller';

const router = Router();
router.get('/:matchId', checkJwt, Openchat);
export default router;
```

### `modules/chat/chat.controller.ts`

```typescript
import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../types/auth';
import { getMessages, getOrCreateConversation, validateUserInMatch } from './chat.service';

export async function Openchat(req: AuthRequest, res: Response): Promise<void> {
  const rawMatchId = req.params.matchId;
  const matchId = Array.isArray(rawMatchId) ? rawMatchId[0] : rawMatchId;
  const userId = req.userId;
  if (!userId || !matchId) { res.status(400).json({ message: 'Invalid request' }); return; }

  const allowed = await validateUserInMatch(matchId, userId);
  if (!allowed) { res.status(403).json({ message: 'Forbidden' }); return; }

  const convo = await getOrCreateConversation(matchId);
  const messages = await getMessages(convo.id);

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) { res.status(404).json({ message: 'Match not found' }); return; }

  const otherUserId = match.userAId === userId ? match.userBId : match.userAId;
  const otherProfile = await prisma.profile.findUnique({
    where: { userId: otherUserId }, include: { user: true },
  });

  res.json({
    conversation: convo,
    messages,
    otherUser: otherProfile ? {
      id: otherUserId,
      name: otherProfile.user?.name || 'Anonymous',
      picture: otherProfile.user?.picture,
      city: otherProfile.city,
      occupation: otherProfile.occupation,
    } : null,
  });
}
```

### `modules/chat/chat.service.ts`

```typescript
import prisma from '../../config/prisma';

export async function getOrCreateConversation(matchId: string) {
  return prisma.conversation.upsert({
    where: { matchId },
    update: {},
    create: { matchId },
  });
}

export async function getMessages(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  return prisma.message.create({
    data: { conversationId, senderId, content },
  });
}

export async function validateUserInMatch(matchId: string, userId: string): Promise<boolean> {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return false;
  return match.userAId === userId || match.userBId === userId;
}
```

### `modules/chat/chat.socket.ts`

```typescript
import { Server } from 'socket.io';
import { sendMessage } from './chat.service';
import { ClientToServerEvents, ServerToClientEvents, SendMessagePayload } from '../../types/socket';

export default function registerChatSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
): void {
  io.on('connection', (socket) => {
    socket.on('join', (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on('send_message', async ({ conversationId, senderId, content }: SendMessagePayload) => {
      const msg = await sendMessage(conversationId, senderId, content);
      io.to(conversationId).emit('new_message', {
        id: msg.id, senderId: msg.senderId,
        content: msg.content, timestamp: msg.createdAt,
      });
    });
  });
}
```

---

## 13. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"],
    "noImplicitAny": true,
    "strictNullChecks": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```
