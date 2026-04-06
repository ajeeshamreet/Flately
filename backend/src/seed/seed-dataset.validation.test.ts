import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type DatasetUser = {
  id: string;
  email: string;
};

type DatasetProfile = {
  id: string;
  userId: string;
  photos: string[];
};

type DatasetPreference = {
  id: string;
  userId: string;
  minBudget: number;
  maxBudget: number;
  weightCleanliness: number;
  weightSleep: number;
  weightHabits: number;
  weightSocial: number;
};

type DatasetSwipe = {
  id: string;
  fromUserId: string;
  toUserId: string;
};

type DatasetMatch = {
  id: string;
  userAId: string;
  userBId: string;
};

type DatasetConversation = {
  id: string;
  matchId: string;
};

type DatasetMessage = {
  id: string;
  conversationId: string;
  senderId: string;
};

type DatasetMeta = {
  totalUsers?: number;
};

type FlatelySeedDataset = {
  _meta?: DatasetMeta;
  users: DatasetUser[];
  profiles: DatasetProfile[];
  preferences: DatasetPreference[];
  swipes: DatasetSwipe[];
  matches: DatasetMatch[];
  conversations: DatasetConversation[];
  messages: DatasetMessage[];
};

function readDataset(): FlatelySeedDataset {
  const datasetPath = path.resolve(process.cwd(), 'seed/flately_dataset.json');
  const content = fs.readFileSync(datasetPath, 'utf8');
  return JSON.parse(content) as FlatelySeedDataset;
}

describe('seed dataset contract', () => {
  const dataset = readDataset();

  it('contains all required top-level collections', () => {
    expect(Array.isArray(dataset.users)).toBe(true);
    expect(Array.isArray(dataset.profiles)).toBe(true);
    expect(Array.isArray(dataset.preferences)).toBe(true);
    expect(Array.isArray(dataset.swipes)).toBe(true);
    expect(Array.isArray(dataset.matches)).toBe(true);
    expect(Array.isArray(dataset.conversations)).toBe(true);
    expect(Array.isArray(dataset.messages)).toBe(true);

    expect(dataset.users.length).toBeGreaterThan(0);
    expect(dataset.profiles.length).toBeGreaterThan(0);
    expect(dataset.preferences.length).toBeGreaterThan(0);
  });

  it('has unique user ids and emails', () => {
    const userIds = dataset.users.map((user) => user.id);
    const userEmails = dataset.users.map((user) => user.email);

    expect(new Set(userIds).size).toBe(dataset.users.length);
    expect(new Set(userEmails).size).toBe(dataset.users.length);
  });

  it('keeps all cross-collection references valid', () => {
    const userIds = new Set(dataset.users.map((user) => user.id));
    const matchIds = new Set(dataset.matches.map((match) => match.id));
    const conversationIds = new Set(dataset.conversations.map((conversation) => conversation.id));

    for (const profile of dataset.profiles) {
      expect(userIds.has(profile.userId), `profile ${profile.id} references missing user`).toBe(true);
      expect(profile.photos.length, `profile ${profile.id} should include at least one photo`).toBeGreaterThan(0);
    }

    for (const preference of dataset.preferences) {
      expect(userIds.has(preference.userId), `preference ${preference.id} references missing user`).toBe(true);
    }

    for (const swipe of dataset.swipes) {
      expect(userIds.has(swipe.fromUserId), `swipe ${swipe.id} fromUserId is invalid`).toBe(true);
      expect(userIds.has(swipe.toUserId), `swipe ${swipe.id} toUserId is invalid`).toBe(true);
      expect(swipe.fromUserId === swipe.toUserId, `swipe ${swipe.id} cannot self-swipe`).toBe(false);
    }

    for (const match of dataset.matches) {
      expect(userIds.has(match.userAId), `match ${match.id} userAId is invalid`).toBe(true);
      expect(userIds.has(match.userBId), `match ${match.id} userBId is invalid`).toBe(true);
      expect(match.userAId === match.userBId, `match ${match.id} must contain two distinct users`).toBe(false);
    }

    for (const conversation of dataset.conversations) {
      expect(matchIds.has(conversation.matchId), `conversation ${conversation.id} references missing match`).toBe(true);
    }

    for (const message of dataset.messages) {
      expect(
        conversationIds.has(message.conversationId),
        `message ${message.id} references missing conversation`,
      ).toBe(true);
      expect(userIds.has(message.senderId), `message ${message.id} references missing sender`).toBe(true);
    }
  });

  it('keeps budget and weight assumptions valid for all preferences', () => {
    for (const preference of dataset.preferences) {
      expect(
        preference.maxBudget >= preference.minBudget,
        `preference ${preference.id} has invalid budget range`,
      ).toBe(true);

      const totalWeight =
        preference.weightCleanliness +
        preference.weightSleep +
        preference.weightHabits +
        preference.weightSocial;

      expect(totalWeight, `preference ${preference.id} weights must total 100`).toBe(100);
    }
  });

  it('matches metadata user count when provided', () => {
    if (typeof dataset._meta?.totalUsers === 'number') {
      expect(dataset.users.length).toBe(dataset._meta.totalUsers);
    }
  });
});
