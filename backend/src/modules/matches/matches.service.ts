import prisma from '../../config/prisma';

interface MatchCheckResult {
  matched: boolean;
  match?: unknown;
}

export async function checkAndCreateMatch(
  fromUserId: string,
  toUserId: string,
): Promise<MatchCheckResult> {
  const reverseSwipe = await prisma.swipe.findUnique({
    where: {
      fromUserId_toUserId: {
        fromUserId: toUserId,
        toUserId: fromUserId,
      },
    },
  });

  if (!reverseSwipe || reverseSwipe.action !== 'like') {
    return { matched: false };
  }

  const userAId = fromUserId < toUserId ? fromUserId : toUserId;
  const userBId = fromUserId < toUserId ? toUserId : fromUserId;

  const match = await prisma.match.upsert({
    where: {
      userAId_userBId: {
        userAId,
        userBId,
      },
    },
    update: {},
    create: {
      userAId,
      userBId,
    },
  });

  return { matched: true, match };
}

function generateMatchTags(
  profile: { hasRoom?: boolean | null; occupation?: string | null } | null,
  preference: { pets?: boolean | null; smoking?: boolean | null } | null,
): string[] {
  const tags: string[] = [];
  if (profile?.hasRoom) tags.push('Has Room');
  if (preference?.pets) tags.push('Pet Friendly');
  if (!preference?.smoking) tags.push('Non-Smoker');
  if (profile?.occupation) tags.push(profile.occupation);
  return tags.slice(0, 3);
}

export async function getMyMatches(userId: string) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    orderBy: { createdAt: 'desc' },
  });

  const otherUserIds = matches.map((match) =>
    match.userAId === userId ? match.userBId : match.userAId,
  );
  const matchIds = matches.map((match) => match.id);

  const [profiles, preferences, conversations] = await Promise.all([
    prisma.profile.findMany({
      where: { userId: { in: otherUserIds } },
      include: { user: true },
    }),
    prisma.preference.findMany({
      where: { userId: { in: otherUserIds } },
    }),
    prisma.conversation.findMany({
      where: { matchId: { in: matchIds } },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
  ]);

  const profileByUserId = new Map(profiles.map((profile) => [profile.userId, profile]));
  const preferenceByUserId = new Map(
    preferences.map((preference) => [preference.userId, preference]),
  );
  const conversationByMatchId = new Map(
    conversations.map((conversation) => [conversation.matchId, conversation]),
  );

  const enrichedMatches = matches.map((match) => {
    const otherUserId = match.userAId === userId ? match.userBId : match.userAId;
    const profile = profileByUserId.get(otherUserId) ?? null;
    const preference = preferenceByUserId.get(otherUserId) ?? null;
    const conversation = conversationByMatchId.get(match.id) ?? null;

    return {
      id: match.id,
      matchedAt: match.createdAt,
      createdAt: match.createdAt,
      otherUser: profile
        ? {
            id: otherUserId,
            name: profile.user?.name || 'Anonymous',
            age: profile.age,
            gender: profile.gender,
            occupation: profile.occupation,
            city: profile.city,
            hasRoom: profile.hasRoom,
            photos: profile.user?.picture ? [profile.user.picture] : [],
            budgetMin: preference?.minBudget || 0,
            budgetMax: preference?.maxBudget || 0,
            tags: generateMatchTags(profile, preference),
          }
        : null,
      compatibility: 85,
      lastMessage: conversation?.messages[0]?.content || null,
      conversationId: conversation?.id || null,
    };
  });

  return enrichedMatches.filter((m) => m.otherUser !== null);
}
