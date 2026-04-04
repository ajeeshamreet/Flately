import prisma from '../../config/prisma';

interface ProfileRecord {
  userId: string;
  city: string | null;
  gender: string | null;
}

interface PreferenceRecord {
  userId: string;
  genderPreference: string;
  minBudget: number;
  maxBudget: number;
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

interface CandidateShape {
  userId: string;
  city: string | null;
  minBudget: number;
  maxBudget: number;
  genderPreference: string;
  gender: string | null;
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

interface EligibilityStrategy {
  isEligible(userA: CandidateShape, userB: CandidateShape): boolean;
}

interface ScoringStrategy {
  calculateScore(prefA: PreferenceShape, prefB: PreferenceShape): number;
}

type RankedMatch = {
  userId: string;
  score: number;
  insertionOrder: number;
};

function mapToCandidateShape(profile: ProfileRecord, preference: PreferenceRecord): CandidateShape {
  return {
    userId: profile.userId,
    city: profile.city,
    minBudget: preference.minBudget,
    maxBudget: preference.maxBudget,
    genderPreference: preference.genderPreference,
    gender: profile.gender,
  };
}

function mapToPreferenceShape(preference: PreferenceRecord): PreferenceShape {
  return {
    cleanliness: preference.cleanliness,
    sleepSchedule: preference.sleepSchedule,
    smoking: preference.smoking,
    drinking: preference.drinking,
    socialLevel: preference.socialLevel,
    weightCleanliness: preference.weightCleanliness,
    weightSleep: preference.weightSleep,
    weightHabits: preference.weightHabits,
    weightSocial: preference.weightSocial,
  };
}

function buildPreferenceLookup(preferences: PreferenceRecord[]): Map<string, PreferenceRecord> {
  const lookup = new Map<string, PreferenceRecord>();
  for (const preference of preferences) {
    lookup.set(preference.userId, preference);
  }
  return lookup;
}

function sortRankedMatches(matches: RankedMatch[]): Array<{ userId: string; score: number }> {
  return matches
    .sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return a.insertionOrder - b.insertionOrder;
    })
    .map(({ userId, score }) => ({ userId, score }));
}

function rankEligibleCandidates(params: {
  viewerCandidate: CandidateShape;
  viewerPreference: PreferenceShape;
  candidates: ProfileRecord[];
  candidatePreferencesByUserId: Map<string, PreferenceRecord>;
  eligibilityStrategy: EligibilityStrategy;
  scoringStrategy: ScoringStrategy;
}): Array<{ userId: string; score: number }> {
  const {
    viewerCandidate,
    viewerPreference,
    candidates,
    candidatePreferencesByUserId,
    eligibilityStrategy,
    scoringStrategy,
  } = params;

  const rankedMatches: RankedMatch[] = [];

  for (const [insertionOrder, candidateProfile] of candidates.entries()) {
    const candidatePreference = candidatePreferencesByUserId.get(candidateProfile.userId);
    if (!candidatePreference) {
      continue;
    }

    const candidate = mapToCandidateShape(candidateProfile, candidatePreference);
    const eligible = eligibilityStrategy.isEligible(viewerCandidate, candidate);

    if (!eligible) {
      continue;
    }

    const score = scoringStrategy.calculateScore(
      viewerPreference,
      mapToPreferenceShape(candidatePreference),
    );

    rankedMatches.push({ userId: candidateProfile.userId, score, insertionOrder });
  }

  return sortRankedMatches(rankedMatches);
}

class DefaultEligibilityStrategy implements EligibilityStrategy {
  isEligible(userA: CandidateShape, userB: CandidateShape): boolean {
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
}

class DefaultScoringStrategy implements ScoringStrategy {
  private similarityScore(a: number, b: number, max = 5): number {
    return 1 - Math.abs(a - b) / max;
  }

  private booleanScore(a: boolean, b: boolean): number {
    return a === b ? 1 : 0;
  }

  calculateScore(prefA: PreferenceShape, prefB: PreferenceShape): number {
    const cleanliness =
      this.similarityScore(prefA.cleanliness, prefB.cleanliness) * prefA.weightCleanliness;

    const sleep =
      this.similarityScore(prefA.sleepSchedule, prefB.sleepSchedule) * prefA.weightSleep;

    const habits =
      ((this.booleanScore(prefA.smoking, prefB.smoking) +
        this.booleanScore(prefA.drinking, prefB.drinking)) /
        2) *
      prefA.weightHabits;

    const social = this.similarityScore(prefA.socialLevel, prefB.socialLevel) * prefA.weightSocial;

    return Math.round(cleanliness + sleep + habits + social);
  }
}

export async function findMatchesForUser(userId: string) {
  const eligibilityStrategy: EligibilityStrategy = new DefaultEligibilityStrategy();
  const scoringStrategy: ScoringStrategy = new DefaultScoringStrategy();

  const userProfile = await prisma.profile.findUnique({ where: { userId } });
  const userPref = await prisma.preference.findUnique({ where: { userId } });

  if (!userProfile || !userPref) {
    throw new Error('PROFILE_OR_PREFERENCES_MISSING');
  }

  const candidateProfiles = await prisma.profile.findMany({
    where: { userId: { not: userId } },
    include: { user: true },
  });
  const candidatePrefs = await prisma.preference.findMany();
  const viewerCandidate = mapToCandidateShape(userProfile, userPref);
  const viewerPreference = mapToPreferenceShape(userPref);
  const candidatePreferencesByUserId = buildPreferenceLookup(candidatePrefs);

  return rankEligibleCandidates({
    viewerCandidate,
    viewerPreference,
    candidates: candidateProfiles,
    candidatePreferencesByUserId,
    eligibilityStrategy,
    scoringStrategy,
  });
}

export const findMatches = findMatchesForUser;
