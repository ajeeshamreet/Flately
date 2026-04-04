import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    profile: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    preference: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../../config/prisma', () => ({
  default: prismaMock,
}));

import { findMatches, findMatchesForUser } from './matching.service';

describe('findMatchesForUser', () => {
  const baseViewerProfile = {
    userId: 'viewer-1',
    city: 'Toronto',
    gender: 'male',
  };

  const baseViewerPreference = {
    userId: 'viewer-1',
    minBudget: 900,
    maxBudget: 1500,
    genderPreference: 'female',
    cleanliness: 5,
    sleepSchedule: 2,
    smoking: false,
    drinking: false,
    socialLevel: 3,
    weightCleanliness: 40,
    weightSleep: 30,
    weightHabits: 20,
    weightSocial: 10,
  };

  function arrangeViewer() {
    prismaMock.profile.findUnique.mockResolvedValue(baseViewerProfile);
    prismaMock.preference.findUnique.mockResolvedValue(baseViewerPreference);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws PROFILE_OR_PREFERENCES_MISSING when profile or preferences are unavailable', async () => {
    prismaMock.profile.findUnique.mockResolvedValue(null);
    prismaMock.preference.findUnique.mockResolvedValue({ userId: 'viewer-1' });

    await expect(findMatchesForUser('viewer-1')).rejects.toThrow(
      'PROFILE_OR_PREFERENCES_MISSING',
    );

    expect(prismaMock.profile.findMany).not.toHaveBeenCalled();
    expect(prismaMock.preference.findMany).not.toHaveBeenCalled();
  });

  it('returns deterministic golden parity: filters ineligible candidates and sorts eligible scores descending', async () => {
    arrangeViewer();

    prismaMock.profile.findMany.mockResolvedValue([
      {
        userId: 'eligible-high',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'eligible-high' },
      },
      {
        userId: 'eligible-low',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'eligible-low' },
      },
      {
        userId: 'ineligible-city',
        city: 'Montreal',
        gender: 'female',
        user: { id: 'ineligible-city' },
      },
      {
        userId: 'ineligible-budget',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'ineligible-budget' },
      },
      {
        userId: 'ineligible-gender-pref-a',
        city: 'Toronto',
        gender: 'male',
        user: { id: 'ineligible-gender-pref-a' },
      },
      {
        userId: 'ineligible-gender-pref-b',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'ineligible-gender-pref-b' },
      },
    ]);

    prismaMock.preference.findMany.mockResolvedValue([
      {
        userId: 'eligible-high',
        minBudget: 800,
        maxBudget: 1200,
        genderPreference: 'any',
        cleanliness: 4,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 4,
        weightCleanliness: 10,
        weightSleep: 10,
        weightHabits: 10,
        weightSocial: 10,
      },
      {
        userId: 'eligible-low',
        minBudget: 1300,
        maxBudget: 1800,
        genderPreference: 'male',
        cleanliness: 3,
        sleepSchedule: 4,
        smoking: true,
        drinking: false,
        socialLevel: 2,
        weightCleanliness: 10,
        weightSleep: 10,
        weightHabits: 10,
        weightSocial: 10,
      },
      {
        userId: 'ineligible-city',
        minBudget: 900,
        maxBudget: 1400,
        genderPreference: 'any',
        cleanliness: 5,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 10,
        weightSleep: 10,
        weightHabits: 10,
        weightSocial: 10,
      },
      {
        userId: 'ineligible-budget',
        minBudget: 1600,
        maxBudget: 2200,
        genderPreference: 'any',
        cleanliness: 5,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 10,
        weightSleep: 10,
        weightHabits: 10,
        weightSocial: 10,
      },
      {
        userId: 'ineligible-gender-pref-a',
        minBudget: 900,
        maxBudget: 1400,
        genderPreference: 'any',
        cleanliness: 5,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 10,
        weightSleep: 10,
        weightHabits: 10,
        weightSocial: 10,
      },
      {
        userId: 'ineligible-gender-pref-b',
        minBudget: 900,
        maxBudget: 1400,
        genderPreference: 'female',
        cleanliness: 5,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 10,
        weightSleep: 10,
        weightHabits: 10,
        weightSocial: 10,
      },
    ]);

    const result = await findMatchesForUser('viewer-1');

    expect(result).toEqual([
      { userId: 'eligible-high', score: 90 },
      { userId: 'eligible-low', score: 60 },
    ]);
  });

  it('treats exact budget-boundary overlap as eligible', async () => {
    arrangeViewer();

    prismaMock.profile.findMany.mockResolvedValue([
      {
        userId: 'boundary-equal',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'boundary-equal' },
      },
    ]);

    prismaMock.preference.findMany.mockResolvedValue([
      {
        userId: 'boundary-equal',
        minBudget: 1500,
        maxBudget: 2200,
        genderPreference: 'male',
        cleanliness: 5,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 1,
        weightSleep: 1,
        weightHabits: 1,
        weightSocial: 1,
      },
    ]);

    const result = await findMatchesForUser('viewer-1');

    expect(result).toEqual([{ userId: 'boundary-equal', score: 100 }]);
  });

  it('skips candidates that do not have a preference record', async () => {
    arrangeViewer();

    prismaMock.profile.findMany.mockResolvedValue([
      {
        userId: 'has-preference',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'has-preference' },
      },
      {
        userId: 'missing-preference',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'missing-preference' },
      },
    ]);

    prismaMock.preference.findMany.mockResolvedValue([
      {
        userId: 'has-preference',
        minBudget: 900,
        maxBudget: 1400,
        genderPreference: 'male',
        cleanliness: 5,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 99,
        weightSleep: 1,
        weightHabits: 1,
        weightSocial: 1,
      },
    ]);

    const result = await findMatchesForUser('viewer-1');

    expect(result).toEqual([{ userId: 'has-preference', score: 100 }]);
  });

  it('uses viewer weights for scoring dominance regardless of candidate weight configuration', async () => {
    arrangeViewer();

    prismaMock.profile.findMany.mockResolvedValue([
      {
        userId: 'weights-low',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'weights-low' },
      },
      {
        userId: 'weights-high',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'weights-high' },
      },
    ]);

    prismaMock.preference.findMany.mockResolvedValue([
      {
        userId: 'weights-low',
        minBudget: 900,
        maxBudget: 1500,
        genderPreference: 'male',
        cleanliness: 3,
        sleepSchedule: 4,
        smoking: true,
        drinking: false,
        socialLevel: 2,
        weightCleanliness: 1,
        weightSleep: 1,
        weightHabits: 1,
        weightSocial: 1,
      },
      {
        userId: 'weights-high',
        minBudget: 900,
        maxBudget: 1500,
        genderPreference: 'male',
        cleanliness: 3,
        sleepSchedule: 4,
        smoking: true,
        drinking: false,
        socialLevel: 2,
        weightCleanliness: 100,
        weightSleep: 100,
        weightHabits: 100,
        weightSocial: 100,
      },
    ]);

    const result = await findMatchesForUser('viewer-1');

    expect(result).toEqual([
      { userId: 'weights-low', score: 60 },
      { userId: 'weights-high', score: 60 },
    ]);
  });

  it('preserves deterministic insertion order when candidate scores tie', async () => {
    arrangeViewer();

    prismaMock.profile.findMany.mockResolvedValue([
      {
        userId: 'tie-first',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'tie-first' },
      },
      {
        userId: 'tie-second',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'tie-second' },
      },
    ]);

    prismaMock.preference.findMany.mockResolvedValue([
      {
        userId: 'tie-first',
        minBudget: 900,
        maxBudget: 1500,
        genderPreference: 'male',
        cleanliness: 5,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 1,
        weightSleep: 1,
        weightHabits: 1,
        weightSocial: 1,
      },
      {
        userId: 'tie-second',
        minBudget: 900,
        maxBudget: 1500,
        genderPreference: 'male',
        cleanliness: 5,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 100,
        weightSleep: 100,
        weightHabits: 100,
        weightSocial: 100,
      },
    ]);

    const result = await findMatchesForUser('viewer-1');

    expect(result).toEqual([
      { userId: 'tie-first', score: 100 },
      { userId: 'tie-second', score: 100 },
    ]);
  });

  it('keeps alias parity: findMatches returns the same output as findMatchesForUser', async () => {
    arrangeViewer();

    prismaMock.profile.findMany.mockResolvedValue([
      {
        userId: 'alias-candidate-1',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'alias-candidate-1' },
      },
      {
        userId: 'alias-candidate-2',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'alias-candidate-2' },
      },
    ]);

    prismaMock.preference.findMany.mockResolvedValue([
      {
        userId: 'alias-candidate-1',
        minBudget: 900,
        maxBudget: 1500,
        genderPreference: 'male',
        cleanliness: 5,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 10,
        weightSleep: 10,
        weightHabits: 10,
        weightSocial: 10,
      },
      {
        userId: 'alias-candidate-2',
        minBudget: 1200,
        maxBudget: 2000,
        genderPreference: 'male',
        cleanliness: 3,
        sleepSchedule: 4,
        smoking: true,
        drinking: false,
        socialLevel: 1,
        weightCleanliness: 10,
        weightSleep: 10,
        weightHabits: 10,
        weightSocial: 10,
      },
    ]);

    const baseline = await findMatchesForUser('viewer-1');
    const aliasResult = await findMatches('viewer-1');

    expect(aliasResult).toEqual(baseline);
  });

  it('treats null/null city as equal and keeps candidate eligible when other constraints pass', async () => {
    prismaMock.profile.findUnique.mockResolvedValue({
      userId: 'viewer-1',
      city: null,
      gender: 'male',
    });
    prismaMock.preference.findUnique.mockResolvedValue(baseViewerPreference);

    prismaMock.profile.findMany.mockResolvedValue([
      {
        userId: 'null-city-eligible',
        city: null,
        gender: 'female',
        user: { id: 'null-city-eligible' },
      },
    ]);

    prismaMock.preference.findMany.mockResolvedValue([
      {
        userId: 'null-city-eligible',
        minBudget: 900,
        maxBudget: 1500,
        genderPreference: 'male',
        cleanliness: 5,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 1,
        weightSleep: 1,
        weightHabits: 1,
        weightSocial: 1,
      },
    ]);

    const result = await findMatchesForUser('viewer-1');

    expect(result).toEqual([{ userId: 'null-city-eligible', score: 100 }]);
  });

  it('uses one batched query per table shape with multiple candidates', async () => {
    arrangeViewer();

    prismaMock.profile.findMany.mockResolvedValue([
      {
        userId: 'shape-a',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'shape-a' },
      },
      {
        userId: 'shape-b',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'shape-b' },
      },
      {
        userId: 'shape-c',
        city: 'Toronto',
        gender: 'female',
        user: { id: 'shape-c' },
      },
    ]);

    prismaMock.preference.findMany.mockResolvedValue([
      {
        userId: 'shape-a',
        minBudget: 900,
        maxBudget: 1400,
        genderPreference: 'male',
        cleanliness: 4,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 1,
        weightSleep: 1,
        weightHabits: 1,
        weightSocial: 1,
      },
      {
        userId: 'shape-b',
        minBudget: 900,
        maxBudget: 1400,
        genderPreference: 'male',
        cleanliness: 3,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 1,
        weightSleep: 1,
        weightHabits: 1,
        weightSocial: 1,
      },
      {
        userId: 'shape-c',
        minBudget: 900,
        maxBudget: 1400,
        genderPreference: 'male',
        cleanliness: 2,
        sleepSchedule: 2,
        smoking: false,
        drinking: false,
        socialLevel: 3,
        weightCleanliness: 1,
        weightSleep: 1,
        weightHabits: 1,
        weightSocial: 1,
      },
    ]);

    await findMatchesForUser('viewer-1');

    expect(prismaMock.profile.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.preference.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.profile.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.preference.findMany).toHaveBeenCalledTimes(1);
  });
});
