import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, findMatchesForUserMock, checkAndCreateMatchMock } = vi.hoisted(() => ({
  prismaMock: {
    swipe: { findMany: vi.fn(), upsert: vi.fn() },
    profile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    preference: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
  findMatchesForUserMock: vi.fn(),
  checkAndCreateMatchMock: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  default: prismaMock,
}));

vi.mock('../matching/matching.service', () => ({
  findMatchesForUser: findMatchesForUserMock,
}));

vi.mock('../matches/matches.service', () => ({
  checkAndCreateMatch: checkAndCreateMatchMock,
}));

import { getDiscoveryFeed, swipeUser } from './discovery.service';

describe('getDiscoveryFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a stable payload with preserved order and filtering semantics', async () => {
    prismaMock.swipe.findMany.mockResolvedValue([{ toUserId: 'user-3' }]);

    findMatchesForUserMock.mockResolvedValue([
      { userId: 'user-2', score: 96 },
      { userId: 'user-3', score: 90 },
      { userId: 'user-4', score: 80 },
      { userId: 'user-5', score: 72 },
    ]);

    prismaMock.profile.findMany.mockResolvedValue([
      {
        userId: 'user-2',
        age: 27,
        gender: 'female',
        occupation: 'Engineer',
        city: 'Toronto',
        hasRoom: true,
        user: { name: 'Alice', picture: 'https://img.test/alice.jpg' },
      },
      {
        userId: 'user-5',
        age: 31,
        gender: 'male',
        occupation: 'Designer',
        city: 'Toronto',
        hasRoom: false,
        user: { name: null, picture: null },
      },
    ]);

    prismaMock.preference.findMany.mockResolvedValue([
      {
        userId: 'user-2',
        minBudget: 900,
        maxBudget: 1500,
        pets: true,
        smoking: false,
        cleanliness: 5,
        socialLevel: 4,
        sleepSchedule: 2,
      },
    ]);

    const feed = await getDiscoveryFeed('viewer-1');

    expect(feed).toEqual([
      {
        id: 'user-2',
        name: 'Alice',
        age: 27,
        gender: 'female',
        occupation: 'Engineer',
        city: 'Toronto',
        hasRoom: true,
        photos: ['https://img.test/alice.jpg'],
        compatibility: 96,
        budgetMin: 900,
        budgetMax: 1500,
        tags: ['Has Room', 'Pet Friendly', 'Non-Smoker', 'Clean & Tidy'],
      },
      {
        id: 'user-5',
        name: 'Anonymous',
        age: 31,
        gender: 'male',
        occupation: 'Designer',
        city: 'Toronto',
        hasRoom: false,
        photos: [],
        compatibility: 72,
        budgetMin: 0,
        budgetMax: 0,
        tags: ['Non-Smoker', 'Quiet', 'Early Bird', 'Designer'],
      },
    ]);
  });

  it('uses batched enrichment queries and avoids per-candidate findUnique fan-out', async () => {
    prismaMock.swipe.findMany.mockResolvedValue([]);

    findMatchesForUserMock.mockResolvedValue([
      { userId: 'user-7', score: 91 },
      { userId: 'user-8', score: 84 },
      { userId: 'user-9', score: 77 },
    ]);

    prismaMock.profile.findMany.mockResolvedValue([
      {
        userId: 'user-7',
        age: 25,
        gender: 'female',
        occupation: 'Analyst',
        city: 'Austin',
        hasRoom: true,
        user: { name: 'Nia', picture: null },
      },
      {
        userId: 'user-8',
        age: 29,
        gender: 'male',
        occupation: 'Developer',
        city: 'Austin',
        hasRoom: false,
        user: { name: 'Liam', picture: null },
      },
      {
        userId: 'user-9',
        age: 33,
        gender: 'female',
        occupation: 'Teacher',
        city: 'Austin',
        hasRoom: true,
        user: { name: 'Maya', picture: null },
      },
    ]);

    prismaMock.preference.findMany.mockResolvedValue([
      {
        userId: 'user-7',
        minBudget: 700,
        maxBudget: 1300,
        pets: false,
        smoking: false,
        cleanliness: 4,
        socialLevel: 3,
        sleepSchedule: 3,
      },
      {
        userId: 'user-8',
        minBudget: 800,
        maxBudget: 1200,
        pets: true,
        smoking: false,
        cleanliness: 3,
        socialLevel: 4,
        sleepSchedule: 4,
      },
      {
        userId: 'user-9',
        minBudget: 900,
        maxBudget: 1500,
        pets: false,
        smoking: true,
        cleanliness: 5,
        socialLevel: 2,
        sleepSchedule: 2,
      },
    ]);

    await getDiscoveryFeed('viewer-2');

    expect(prismaMock.profile.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.profile.findMany).toHaveBeenCalledWith({
      where: { userId: { in: ['user-7', 'user-8', 'user-9'] } },
      include: { user: true },
    });

    expect(prismaMock.preference.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.preference.findMany).toHaveBeenCalledWith({
      where: { userId: { in: ['user-7', 'user-8', 'user-9'] } },
    });

    expect(prismaMock.profile.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.preference.findUnique).not.toHaveBeenCalled();
  });
});

describe('swipeUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes superlike to like, calls checkAndCreateMatch once, and passes through matched=true', async () => {
    const persistedSwipe = {
      fromUserId: 'viewer-1',
      toUserId: 'user-2',
      action: 'like',
    };

    prismaMock.swipe.upsert.mockResolvedValue(persistedSwipe);
    checkAndCreateMatchMock.mockResolvedValue({ matched: true });

    const result = await swipeUser('viewer-1', 'user-2', 'superlike');

    expect(prismaMock.swipe.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.swipe.upsert).toHaveBeenCalledWith({
      where: {
        fromUserId_toUserId: {
          fromUserId: 'viewer-1',
          toUserId: 'user-2',
        },
      },
      update: { action: 'like' },
      create: {
        fromUserId: 'viewer-1',
        toUserId: 'user-2',
        action: 'like',
      },
    });

    expect(checkAndCreateMatchMock).toHaveBeenCalledTimes(1);
    expect(checkAndCreateMatchMock).toHaveBeenCalledWith('viewer-1', 'user-2');
    expect(result).toEqual({ swipe: persistedSwipe, matched: true });
  });

  it('normalizes superlike to like, calls checkAndCreateMatch once, and passes through matched=false', async () => {
    const persistedSwipe = {
      fromUserId: 'viewer-1',
      toUserId: 'user-3',
      action: 'like',
    };

    prismaMock.swipe.upsert.mockResolvedValue(persistedSwipe);
    checkAndCreateMatchMock.mockResolvedValue({ matched: false });

    const result = await swipeUser('viewer-1', 'user-3', 'superlike');

    expect(prismaMock.swipe.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.swipe.upsert).toHaveBeenCalledWith({
      where: {
        fromUserId_toUserId: {
          fromUserId: 'viewer-1',
          toUserId: 'user-3',
        },
      },
      update: { action: 'like' },
      create: {
        fromUserId: 'viewer-1',
        toUserId: 'user-3',
        action: 'like',
      },
    });

    expect(checkAndCreateMatchMock).toHaveBeenCalledTimes(1);
    expect(checkAndCreateMatchMock).toHaveBeenCalledWith('viewer-1', 'user-3');
    expect(result).toEqual({ swipe: persistedSwipe, matched: false });
  });

  it('normalizes skip to dislike and does not invoke checkAndCreateMatch', async () => {
    const persistedSwipe = {
      fromUserId: 'viewer-1',
      toUserId: 'user-4',
      action: 'dislike',
    };

    prismaMock.swipe.upsert.mockResolvedValue(persistedSwipe);

    const result = await swipeUser('viewer-1', 'user-4', 'skip');

    expect(prismaMock.swipe.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.swipe.upsert).toHaveBeenCalledWith({
      where: {
        fromUserId_toUserId: {
          fromUserId: 'viewer-1',
          toUserId: 'user-4',
        },
      },
      update: { action: 'dislike' },
      create: {
        fromUserId: 'viewer-1',
        toUserId: 'user-4',
        action: 'dislike',
      },
    });

    expect(checkAndCreateMatchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ swipe: persistedSwipe, matched: false });
  });
});
