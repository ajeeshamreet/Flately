import prisma from '../../config/prisma';

interface CandidateShape {
  userId: string;
  city: string;
  minBudget: number;
  maxBudget: number;
  genderPreference: string;
  gender: string;
}

interface PreferenceShape {
  cleanliness: number;
  sleepSchedule: number;
  smoking: boolean;
  drinking: boolean;
  socialLevel: number;
  weightCleanliness: number;
  weightSleep: number;
  weightHabits: number;
  weightSocial: number;
}

function isEligible(userA: CandidateShape, userB: CandidateShape): boolean {
  if (userA.userId === userB.userId) return false;
  if (userA.city !== userB.city) return false;

  if (userA.maxBudget < userB.minBudget || userB.maxBudget < userA.minBudget) {
    return false;
  }

  if (userA.genderPreference !== 'any' && userA.genderPreference !== userB.gender) {
    return false;
  }

  if (userB.genderPreference !== 'any' && userB.genderPreference !== userA.gender) {
    return false;
  }

  return true;
}

function similarityScore(a: number, b: number, max = 5): number {
  return 1 - Math.abs(a - b) / max;
}

function booleanScore(a: boolean, b: boolean): number {
  return a === b ? 1 : 0;
}

function calculateScore(prefA: PreferenceShape, prefB: PreferenceShape): number {
  const cleanliness =
    similarityScore(prefA.cleanliness, prefB.cleanliness) * prefA.weightCleanliness;

  const sleep = similarityScore(prefA.sleepSchedule, prefB.sleepSchedule) * prefA.weightSleep;

  const habits =
    ((booleanScore(prefA.smoking, prefB.smoking) +
      booleanScore(prefA.drinking, prefB.drinking)) /
      2) *
    prefA.weightHabits;

  const social = similarityScore(prefA.socialLevel, prefB.socialLevel) * prefA.weightSocial;

  return Math.round(cleanliness + sleep + habits + social);
}

export async function findMatchesForUser(userId: string) {
  const userProfile = await prisma.profile.findUnique({ where: { userId } });
  const userPref = await prisma.preference.findUnique({ where: { userId } });

  if (!userProfile || !userPref) {
    throw new Error('PROFILE_OR_PREFERENCES_MISSING');
  }

  const candidates = await prisma.profile.findMany({
    where: { userId: { not: userId } },
    include: { user: true },
  });
  const candidatePrefs = await prisma.preference.findMany();

  const results: Array<{ userId: string; score: number }> = [];

  for (const candidate of candidates) {
    const candidatePref = candidatePrefs.find((p) => p.userId === candidate.userId);
    if (!candidatePref) {
      continue;
    }

    const eligible = isEligible(
      {
        ...(userProfile as unknown as CandidateShape),
        ...(userPref as unknown as CandidateShape),
      },
      {
        ...(candidate as unknown as CandidateShape),
        ...(candidatePref as unknown as CandidateShape),
      },
    );

    if (!eligible) {
      continue;
    }

    const score = calculateScore(
      userPref as unknown as PreferenceShape,
      candidatePref as unknown as PreferenceShape,
    );

    results.push({ userId: candidate.userId, score });
  }

  return results.sort((a, b) => b.score - a.score);
}

export const findMatches = findMatchesForUser;
