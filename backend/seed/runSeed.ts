import dotenv from 'dotenv';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

dotenv.config({ override: true });

const prisma = new PrismaClient();
const DATASET_FILE_NAME = 'flately_dataset.json';

type SeedOptions = {
  reset: boolean;
  dryRun: boolean;
};

type DatasetMeta = {
  app?: string;
  description?: string;
  totalUsers?: number;
};

type DatasetUser = {
  id: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  name: string | null;
  picture: string | null;
  createdAt: string;
  updatedAt: string;
};

type DatasetProfile = {
  id: string;
  userId: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  bio: string | null;
  photos: string[];
  city: string | null;
  hasRoom: boolean;
  occupation: string | null;
  sleepSchedule: string | null;
  noiseLevel: number | null;
  guestPolicy: string | null;
  smoking: string | null;
  pets: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

type DatasetPreference = {
  id: string;
  userId: string;
  genderPreference: 'male' | 'female' | 'any';
  minBudget: number;
  maxBudget: number;
  city: string;
  cleanliness: number;
  sleepSchedule: number;
  smoking: boolean;
  drinking: boolean;
  pets: boolean;
  socialLevel: number;
  weightCleanliness: number;
  weightSleep: number;
  weightHabits: number;
  weightSocial: number;
  createdAt: string;
  updatedAt: string;
};

type DatasetSwipe = {
  id: string;
  fromUserId: string;
  toUserId: string;
  action: string;
  createdAt: string;
};

type DatasetMatch = {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: string;
};

type DatasetConversation = {
  id: string;
  matchId: string;
  createdAt: string;
};

type DatasetMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

type FlatelyDataset = {
  _meta?: DatasetMeta;
  users: DatasetUser[];
  profiles: DatasetProfile[];
  preferences: DatasetPreference[];
  swipes: DatasetSwipe[];
  matches: DatasetMatch[];
  conversations: DatasetConversation[];
  messages: DatasetMessage[];
};

function parseOptions(argv: string[]): SeedOptions {
  const flags = new Set(argv.slice(2));
  return {
    reset: flags.has('--reset'),
    dryRun: flags.has('--dry-run'),
  };
}

function getDatasetPath(): string {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirectoryPath = path.dirname(currentFilePath);
  return path.resolve(currentDirectoryPath, DATASET_FILE_NAME);
}

function parseDate(value: string, label: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`INVALID_DATE_${label}`);
  }

  return date;
}

async function loadDataset(datasetPath: string): Promise<FlatelyDataset> {
  const rawContent = await readFile(datasetPath, 'utf8');
  const parsed = JSON.parse(rawContent) as FlatelyDataset;

  if (!Array.isArray(parsed.users)) {
    throw new Error('DATASET_USERS_MISSING');
  }

  if (!Array.isArray(parsed.profiles)) {
    throw new Error('DATASET_PROFILES_MISSING');
  }

  if (!Array.isArray(parsed.preferences)) {
    throw new Error('DATASET_PREFERENCES_MISSING');
  }

  if (!Array.isArray(parsed.swipes)) {
    throw new Error('DATASET_SWIPES_MISSING');
  }

  if (!Array.isArray(parsed.matches)) {
    throw new Error('DATASET_MATCHES_MISSING');
  }

  if (!Array.isArray(parsed.conversations)) {
    throw new Error('DATASET_CONVERSATIONS_MISSING');
  }

  if (!Array.isArray(parsed.messages)) {
    throw new Error('DATASET_MESSAGES_MISSING');
  }

  return parsed;
}

function getOrderedPair(userIdA: string, userIdB: string): { userAId: string; userBId: string } {
  return userIdA < userIdB
    ? { userAId: userIdA, userBId: userIdB }
    : { userAId: userIdB, userBId: userIdA };
}

function validateReferences(dataset: FlatelyDataset): string[] {
  const issues: string[] = [];
  const userIds = new Set(dataset.users.map((user) => user.id));
  const matchIds = new Set(dataset.matches.map((match) => match.id));
  const conversationIds = new Set(dataset.conversations.map((conversation) => conversation.id));

  for (const profile of dataset.profiles) {
    if (!userIds.has(profile.userId)) {
      issues.push(`PROFILE_USER_MISSING:${profile.id}`);
    }
  }

  for (const preference of dataset.preferences) {
    if (!userIds.has(preference.userId)) {
      issues.push(`PREFERENCE_USER_MISSING:${preference.id}`);
    }
  }

  for (const swipe of dataset.swipes) {
    if (!userIds.has(swipe.fromUserId)) {
      issues.push(`SWIPE_FROM_USER_MISSING:${swipe.id}`);
    }
    if (!userIds.has(swipe.toUserId)) {
      issues.push(`SWIPE_TO_USER_MISSING:${swipe.id}`);
    }
  }

  for (const match of dataset.matches) {
    if (!userIds.has(match.userAId)) {
      issues.push(`MATCH_USER_A_MISSING:${match.id}`);
    }
    if (!userIds.has(match.userBId)) {
      issues.push(`MATCH_USER_B_MISSING:${match.id}`);
    }
  }

  for (const conversation of dataset.conversations) {
    if (!matchIds.has(conversation.matchId)) {
      issues.push(`CONVERSATION_MATCH_MISSING:${conversation.id}`);
    }
  }

  for (const message of dataset.messages) {
    if (!conversationIds.has(message.conversationId)) {
      issues.push(`MESSAGE_CONVERSATION_MISSING:${message.id}`);
    }
    if (!userIds.has(message.senderId)) {
      issues.push(`MESSAGE_SENDER_MISSING:${message.id}`);
    }
  }

  return issues;
}

async function resetDatabase(): Promise<void> {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers(users: DatasetUser[]): Promise<Map<string, string>> {
  const userIdMap = new Map<string, string>();

  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash: user.passwordHash,
        googleId: user.googleId,
        name: user.name,
        picture: user.picture,
      },
      create: {
        email: user.email,
        passwordHash: user.passwordHash,
        googleId: user.googleId,
        name: user.name,
        picture: user.picture,
        createdAt: parseDate(user.createdAt, `USER_${user.id}_CREATED_AT`),
      },
      select: {
        id: true,
      },
    });

    userIdMap.set(user.id, created.id);
  }

  return userIdMap;
}

async function seedProfiles(
  profiles: DatasetProfile[],
  userIdMap: Map<string, string>,
): Promise<void> {
  for (const profile of profiles) {
    const mappedUserId = userIdMap.get(profile.userId);
    if (!mappedUserId) {
      throw new Error(`PROFILE_USER_MAP_MISSING:${profile.id}`);
    }

    await prisma.profile.upsert({
      where: { userId: mappedUserId },
      update: {
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        bio: profile.bio,
        photos: profile.photos,
        city: profile.city,
        hasRoom: profile.hasRoom,
        occupation: profile.occupation,
        sleepSchedule: profile.sleepSchedule,
        noiseLevel: profile.noiseLevel,
        guestPolicy: profile.guestPolicy,
        smoking: profile.smoking,
        pets: profile.pets,
        onboardingCompleted: profile.onboardingCompleted,
      },
      create: {
        userId: mappedUserId,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        bio: profile.bio,
        photos: profile.photos,
        city: profile.city,
        hasRoom: profile.hasRoom,
        occupation: profile.occupation,
        sleepSchedule: profile.sleepSchedule,
        noiseLevel: profile.noiseLevel,
        guestPolicy: profile.guestPolicy,
        smoking: profile.smoking,
        pets: profile.pets,
        onboardingCompleted: profile.onboardingCompleted,
        createdAt: parseDate(profile.createdAt, `PROFILE_${profile.id}_CREATED_AT`),
      },
    });
  }
}

async function seedPreferences(
  preferences: DatasetPreference[],
  userIdMap: Map<string, string>,
): Promise<void> {
  for (const preference of preferences) {
    const mappedUserId = userIdMap.get(preference.userId);
    if (!mappedUserId) {
      throw new Error(`PREFERENCE_USER_MAP_MISSING:${preference.id}`);
    }

    await prisma.preference.upsert({
      where: { userId: mappedUserId },
      update: {
        genderPreference: preference.genderPreference,
        minBudget: preference.minBudget,
        maxBudget: preference.maxBudget,
        city: preference.city,
        cleanliness: preference.cleanliness,
        sleepSchedule: preference.sleepSchedule,
        smoking: preference.smoking,
        drinking: preference.drinking,
        pets: preference.pets,
        socialLevel: preference.socialLevel,
        weightCleanliness: preference.weightCleanliness,
        weightSleep: preference.weightSleep,
        weightHabits: preference.weightHabits,
        weightSocial: preference.weightSocial,
      },
      create: {
        userId: mappedUserId,
        genderPreference: preference.genderPreference,
        minBudget: preference.minBudget,
        maxBudget: preference.maxBudget,
        city: preference.city,
        cleanliness: preference.cleanliness,
        sleepSchedule: preference.sleepSchedule,
        smoking: preference.smoking,
        drinking: preference.drinking,
        pets: preference.pets,
        socialLevel: preference.socialLevel,
        weightCleanliness: preference.weightCleanliness,
        weightSleep: preference.weightSleep,
        weightHabits: preference.weightHabits,
        weightSocial: preference.weightSocial,
        createdAt: parseDate(preference.createdAt, `PREFERENCE_${preference.id}_CREATED_AT`),
      },
    });
  }
}

async function seedSwipes(swipes: DatasetSwipe[], userIdMap: Map<string, string>): Promise<void> {
  for (const swipe of swipes) {
    const fromUserId = userIdMap.get(swipe.fromUserId);
    const toUserId = userIdMap.get(swipe.toUserId);

    if (!fromUserId || !toUserId) {
      throw new Error(`SWIPE_USER_MAP_MISSING:${swipe.id}`);
    }

    await prisma.swipe.upsert({
      where: {
        fromUserId_toUserId: {
          fromUserId,
          toUserId,
        },
      },
      update: {
        action: swipe.action,
      },
      create: {
        fromUserId,
        toUserId,
        action: swipe.action,
        createdAt: parseDate(swipe.createdAt, `SWIPE_${swipe.id}_CREATED_AT`),
      },
    });
  }
}

async function seedMatches(
  matches: DatasetMatch[],
  userIdMap: Map<string, string>,
): Promise<Map<string, string>> {
  const matchIdMap = new Map<string, string>();

  for (const match of matches) {
    const userAId = userIdMap.get(match.userAId);
    const userBId = userIdMap.get(match.userBId);

    if (!userAId || !userBId) {
      throw new Error(`MATCH_USER_MAP_MISSING:${match.id}`);
    }

    const orderedPair = getOrderedPair(userAId, userBId);
    const upsertedMatch = await prisma.match.upsert({
      where: {
        userAId_userBId: orderedPair,
      },
      update: {},
      create: {
        ...orderedPair,
        createdAt: parseDate(match.createdAt, `MATCH_${match.id}_CREATED_AT`),
      },
      select: {
        id: true,
      },
    });

    matchIdMap.set(match.id, upsertedMatch.id);
  }

  return matchIdMap;
}

async function seedConversations(
  conversations: DatasetConversation[],
  matchIdMap: Map<string, string>,
): Promise<Map<string, string>> {
  const conversationIdMap = new Map<string, string>();

  for (const conversation of conversations) {
    const mappedMatchId = matchIdMap.get(conversation.matchId);
    if (!mappedMatchId) {
      throw new Error(`CONVERSATION_MATCH_MAP_MISSING:${conversation.id}`);
    }

    const upsertedConversation = await prisma.conversation.upsert({
      where: {
        matchId: mappedMatchId,
      },
      update: {},
      create: {
        matchId: mappedMatchId,
        createdAt: parseDate(
          conversation.createdAt,
          `CONVERSATION_${conversation.id}_CREATED_AT`,
        ),
      },
      select: {
        id: true,
      },
    });

    conversationIdMap.set(conversation.id, upsertedConversation.id);
  }

  return conversationIdMap;
}

async function seedMessages(
  messages: DatasetMessage[],
  conversationIdMap: Map<string, string>,
  userIdMap: Map<string, string>,
): Promise<void> {
  const orderedMessages = [...messages].sort(
    (a, b) =>
      parseDate(a.createdAt, `MESSAGE_${a.id}_CREATED_AT`).getTime() -
      parseDate(b.createdAt, `MESSAGE_${b.id}_CREATED_AT`).getTime(),
  );

  for (const message of orderedMessages) {
    const mappedConversationId = conversationIdMap.get(message.conversationId);
    const mappedSenderId = userIdMap.get(message.senderId);

    if (!mappedConversationId || !mappedSenderId) {
      throw new Error(`MESSAGE_LINK_MAP_MISSING:${message.id}`);
    }

    const existingMessage = await prisma.message.findFirst({
      where: {
        conversationId: mappedConversationId,
        senderId: mappedSenderId,
        content: message.content,
      },
      select: {
        id: true,
      },
    });

    if (existingMessage) {
      continue;
    }

    await prisma.message.create({
      data: {
        conversationId: mappedConversationId,
        senderId: mappedSenderId,
        content: message.content,
        createdAt: parseDate(message.createdAt, `MESSAGE_${message.id}_CREATED_AT`),
      },
    });
  }
}

function logDatasetSummary(dataset: FlatelyDataset): void {
  console.log(`📦 Dataset: ${dataset._meta?.app || 'Flately'}`);
  if (dataset._meta?.description) {
    console.log(`📝 ${dataset._meta.description}`);
  }

  console.log(
    `📊 users=${dataset.users.length}, profiles=${dataset.profiles.length}, preferences=${dataset.preferences.length}, swipes=${dataset.swipes.length}, matches=${dataset.matches.length}, conversations=${dataset.conversations.length}, messages=${dataset.messages.length}`,
  );

  if (typeof dataset._meta?.totalUsers === 'number' && dataset._meta.totalUsers !== dataset.users.length) {
    console.warn(
      `⚠️ _meta.totalUsers=${dataset._meta.totalUsers} does not match users.length=${dataset.users.length}`,
    );
  }
}

export async function runSeed(): Promise<void> {
  const options = parseOptions(process.argv);
  const datasetPath = getDatasetPath();

  console.log('🌱 Starting Flately seed...');
  console.log(`📁 Dataset path: ${datasetPath}`);

  const dataset = await loadDataset(datasetPath);
  logDatasetSummary(dataset);

  const referenceIssues = validateReferences(dataset);
  if (referenceIssues.length > 0) {
    throw new Error(`DATASET_REFERENCE_ERRORS:\n${referenceIssues.join('\n')}`);
  }

  if (options.dryRun) {
    console.log('🧪 Dry run requested. Validation complete, no database writes performed.');
    return;
  }

  if (options.reset) {
    console.log('🧹 --reset detected. Clearing existing data...');
    await resetDatabase();
    console.log('✅ Existing data cleared');
  }

  const userIdMap = await seedUsers(dataset.users);
  console.log(`✅ Users upserted: ${userIdMap.size}`);

  await seedProfiles(dataset.profiles, userIdMap);
  console.log(`✅ Profiles upserted: ${dataset.profiles.length}`);

  await seedPreferences(dataset.preferences, userIdMap);
  console.log(`✅ Preferences upserted: ${dataset.preferences.length}`);

  await seedSwipes(dataset.swipes, userIdMap);
  console.log(`✅ Swipes upserted: ${dataset.swipes.length}`);

  const matchIdMap = await seedMatches(dataset.matches, userIdMap);
  console.log(`✅ Matches upserted: ${matchIdMap.size}`);

  const conversationIdMap = await seedConversations(dataset.conversations, matchIdMap);
  console.log(`✅ Conversations upserted: ${conversationIdMap.size}`);

  await seedMessages(dataset.messages, conversationIdMap, userIdMap);
  console.log(`✅ Messages ensured: ${dataset.messages.length}`);

  console.log('🎉 Seed complete');
}

export async function disconnectSeedClient(): Promise<void> {
  await prisma.$disconnect();
}
