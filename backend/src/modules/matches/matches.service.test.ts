import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, findMatchesForUserMock } = vi.hoisted(() => ({
  prismaMock: {
    match: { findMany: vi.fn(), upsert: vi.fn() },
    swipe: { findUnique: vi.fn() },
    profile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    preference: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    conversation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
  findMatchesForUserMock: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  default: prismaMock,
}));

vi.mock('../matching/matching.service', () => ({
  findMatchesForUser: findMatchesForUserMock,
}));

import { checkAndCreateMatch, getMyMatches } from './matches.service';

describe('checkAndCreateMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns matched false and skips upsert when reverse swipe is missing', async () => {
    prismaMock.swipe.findUnique.mockResolvedValue(null);

    const result = await checkAndCreateMatch('viewer-1', 'user-2');

    expect(prismaMock.swipe.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.swipe.findUnique).toHaveBeenCalledWith({
      where: {
        fromUserId_toUserId: {
          fromUserId: 'user-2',
          toUserId: 'viewer-1',
        },
      },
    });
    expect(prismaMock.match.upsert).not.toHaveBeenCalled();
    expect(result).toEqual({ matched: false });
  });

  it('returns matched false and skips upsert when reverse swipe is dislike', async () => {
    prismaMock.swipe.findUnique.mockResolvedValue({ action: 'dislike' });

    const result = await checkAndCreateMatch('viewer-1', 'user-2');

    expect(prismaMock.swipe.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.swipe.findUnique).toHaveBeenCalledWith({
      where: {
        fromUserId_toUserId: {
          fromUserId: 'user-2',
          toUserId: 'viewer-1',
        },
      },
    });
    expect(prismaMock.match.upsert).not.toHaveBeenCalled();
    expect(result).toEqual({ matched: false });
  });

  it('returns matched true and upserts using canonical userAId/userBId ordering regardless of call order', async () => {
    const persistedMatch = { id: 'match-10', userAId: 'alpha-user', userBId: 'zeta-user' };

    prismaMock.swipe.findUnique.mockResolvedValue({ action: 'like' });
    prismaMock.match.upsert.mockResolvedValue(persistedMatch);

    const result = await checkAndCreateMatch('zeta-user', 'alpha-user');

    expect(prismaMock.swipe.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.swipe.findUnique).toHaveBeenCalledWith({
      where: {
        fromUserId_toUserId: {
          fromUserId: 'alpha-user',
          toUserId: 'zeta-user',
        },
      },
    });

    expect(prismaMock.match.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.match.upsert).toHaveBeenCalledWith({
      where: {
        userAId_userBId: {
          userAId: 'alpha-user',
          userBId: 'zeta-user',
        },
      },
      update: {},
      create: {
        userAId: 'alpha-user',
        userBId: 'zeta-user',
      },
    });

    expect(result).toEqual({ matched: true, match: persistedMatch });
  });
});

describe('getMyMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns stable payload parity with preserved order and null-profile filtering', async () => {
    const matchDateA = new Date('2026-04-04T08:00:00.000Z');
    const matchDateB = new Date('2026-04-03T08:00:00.000Z');
    const matchDateC = new Date('2026-04-02T08:00:00.000Z');

    prismaMock.match.findMany.mockResolvedValue([
      { id: 'match-1', userAId: 'viewer-1', userBId: 'user-2', createdAt: matchDateA },
      { id: 'match-2', userAId: 'user-3', userBId: 'viewer-1', createdAt: matchDateB },
      { id: 'match-3', userAId: 'viewer-1', userBId: 'user-4', createdAt: matchDateC },
    ]);

    prismaMock.profile.findMany.mockResolvedValue([
      {
        userId: 'user-2',
        age: 28,
        gender: 'female',
        occupation: 'Engineer',
        city: 'Toronto',
        hasRoom: true,
        user: { name: 'Alice', picture: 'https://img.test/alice.jpg' },
      },
      {
        userId: 'user-4',
        age: 31,
        gender: 'male',
        occupation: 'Artist',
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
      },
    ]);

    prismaMock.conversation.findMany.mockResolvedValue([
      {
        id: 'conversation-1',
        matchId: 'match-1',
        messages: [{ content: 'Latest hello', createdAt: new Date('2026-04-04T09:00:00.000Z') }],
      },
      {
        id: 'conversation-2',
        matchId: 'match-2',
        messages: [{ content: 'Filtered out by null profile', createdAt: new Date('2026-04-03T09:00:00.000Z') }],
      },
    ]);

    findMatchesForUserMock.mockResolvedValue([
      { userId: 'user-2', score: 93 },
      { userId: 'user-4', score: 71 },
    ]);

    const result = await getMyMatches('viewer-1');

    expect(result).toEqual([
      {
        id: 'match-1',
        matchedAt: matchDateA,
        createdAt: matchDateA,
        otherUser: {
          id: 'user-2',
          name: 'Alice',
          age: 28,
          gender: 'female',
          occupation: 'Engineer',
          city: 'Toronto',
          hasRoom: true,
          photos: ['https://img.test/alice.jpg'],
          budgetMin: 900,
          budgetMax: 1500,
          tags: ['Has Room', 'Pet Friendly', 'Non-Smoker'],
        },
        compatibility: 93,
        lastMessage: 'Latest hello',
        conversationId: 'conversation-1',
      },
      {
        id: 'match-3',
        matchedAt: matchDateC,
        createdAt: matchDateC,
        otherUser: {
          id: 'user-4',
          name: 'Anonymous',
          age: 31,
          gender: 'male',
          occupation: 'Artist',
          city: 'Toronto',
          hasRoom: false,
          photos: [],
          budgetMin: 0,
          budgetMax: 0,
          tags: ['Non-Smoker', 'Artist'],
        },
        compatibility: 71,
        lastMessage: null,
        conversationId: null,
      },
    ]);

    expect(findMatchesForUserMock).toHaveBeenCalledTimes(1);
    expect(findMatchesForUserMock).toHaveBeenCalledWith('viewer-1');
  });

  it('uses batched findMany enrichment and avoids per-match findUnique fan-out', async () => {
    prismaMock.match.findMany.mockResolvedValue([
      { id: 'match-11', userAId: 'viewer-2', userBId: 'user-7', createdAt: new Date('2026-03-04T08:00:00.000Z') },
      { id: 'match-12', userAId: 'user-8', userBId: 'viewer-2', createdAt: new Date('2026-03-03T08:00:00.000Z') },
      { id: 'match-13', userAId: 'viewer-2', userBId: 'user-9', createdAt: new Date('2026-03-02T08:00:00.000Z') },
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
      { userId: 'user-7', minBudget: 700, maxBudget: 1200, pets: false, smoking: false },
      { userId: 'user-8', minBudget: 800, maxBudget: 1300, pets: true, smoking: false },
      { userId: 'user-9', minBudget: 900, maxBudget: 1500, pets: false, smoking: true },
    ]);

    prismaMock.conversation.findMany.mockResolvedValue([
      { id: 'conversation-11', matchId: 'match-11', messages: [] },
      { id: 'conversation-12', matchId: 'match-12', messages: [] },
      { id: 'conversation-13', matchId: 'match-13', messages: [] },
    ]);

    findMatchesForUserMock.mockResolvedValue([
      { userId: 'user-7', score: 91 },
      { userId: 'user-8', score: 84 },
      { userId: 'user-9', score: 77 },
    ]);

    await getMyMatches('viewer-2');

    expect(prismaMock.match.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.match.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ userAId: 'viewer-2' }, { userBId: 'viewer-2' }],
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(prismaMock.profile.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.profile.findMany).toHaveBeenCalledWith({
      where: { userId: { in: ['user-7', 'user-8', 'user-9'] } },
      include: { user: true },
    });

    expect(prismaMock.preference.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.preference.findMany).toHaveBeenCalledWith({
      where: { userId: { in: ['user-7', 'user-8', 'user-9'] } },
    });

    expect(prismaMock.conversation.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.conversation.findMany).toHaveBeenCalledWith({
      where: { matchId: { in: ['match-11', 'match-12', 'match-13'] } },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    expect(prismaMock.profile.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.preference.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.conversation.findUnique).not.toHaveBeenCalled();
    expect(findMatchesForUserMock).toHaveBeenCalledTimes(1);
    expect(findMatchesForUserMock).toHaveBeenCalledWith('viewer-2');
  });
});
