import prisma from '../../config/prisma';
import { checkAndCreateMatch } from '../matches/matches.service';
import { findMatchesForUser } from '../matching/matching.service';

interface MatchCandidate {
  userId: string;
  score: number;
}

interface TaggableProfile {
  hasRoom?: boolean | null;
  occupation?: string | null;
}

interface TaggablePreference {
  pets?: boolean | null;
  smoking?: boolean | null;
  cleanliness?: number | null;
  socialLevel?: number | null;
  sleepSchedule?: number | null;
}

export async function getDiscoveryFeed(userId: string) {
  const swipes = await prisma.swipe.findMany({
    where: { fromUserId: userId },
    select: { toUserId: true },
  });

  const excludedUserIds = swipes.map((s) => s.toUserId);
  const matches = (await findMatchesForUser(userId)) as MatchCandidate[];
  const filtered = matches.filter((m) => !excludedUserIds.includes(m.userId));

  const filteredUserIds = filtered.map((match) => match.userId);

  const [profiles, preferences] = await Promise.all([
    prisma.profile.findMany({
      where: { userId: { in: filteredUserIds } },
      include: { user: true },
    }),
    prisma.preference.findMany({
      where: { userId: { in: filteredUserIds } },
    }),
  ]);

  const profileByUserId = new Map(profiles.map((profile) => [profile.userId, profile]));
  const preferenceByUserId = new Map(
    preferences.map((preference) => [preference.userId, preference]),
  );

  const enrichedProfiles = await Promise.all(
    filtered.map(async (match) => {
      const profile = profileByUserId.get(match.userId);
      const preference = preferenceByUserId.get(match.userId) ?? null;

      if (!profile) {
        return null;
      }

      return {
        id: match.userId,
        name: profile.user?.name || 'Anonymous',
        age: profile.age,
        gender: profile.gender,
        occupation: profile.occupation,
        city: profile.city,
        hasRoom: profile.hasRoom,
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

function generateTags(profile: TaggableProfile, preference: TaggablePreference | null) {
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
  // Normalize action: 'superlike' -> 'like', 'skip' -> 'dislike'
  const normalizedAction = action === 'superlike' ? 'like' : action === 'skip' ? 'dislike' : action;

  const swipe = await prisma.swipe.upsert({
    where: {
      fromUserId_toUserId: {
        fromUserId,
        toUserId,
      },
    },
    update: { action: normalizedAction },
    create: {
      fromUserId,
      toUserId,
      action: normalizedAction,
    },
  });

  let matched = false;
  // Check for match on like or superlike
  if (normalizedAction === 'like') {
    const result = await checkAndCreateMatch(fromUserId, toUserId);
    matched = result?.matched || false;
  }

  return { swipe, matched };
}
