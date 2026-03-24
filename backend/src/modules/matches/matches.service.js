const prisma = require("../../config/prisma");

async function checkAndCreateMatch(fromUserId, toUserId) {
  const reverseSwipe = await prisma.swipe.findUnique({
    where: {
      fromUserId_toUserId: {
        fromUserId: toUserId,
        toUserId: fromUserId
      }
    }
  });

  if (!reverseSwipe || reverseSwipe.action !== 'like') {
    return { matched: false }
  }

  const userAId = fromUserId < toUserId ? fromUserId : toUserId
  const userBId = fromUserId < toUserId ? toUserId : fromUserId

  const match = await prisma.match.upsert({
    where: {
      userAId_userBId: {
        userAId, userBId
      }
    },
    update: {},
    create: {
      userAId,
      userBId
    }
  })
  return { matched: true, match };
}

async function getMyMatches(userId) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }]
    },
    orderBy: { createdAt: 'desc' }
  })

  // Enrich each match with the other user's profile
  const enrichedMatches = await Promise.all(
    matches.map(async (match) => {
      const otherUserId = match.userAId === userId ? match.userBId : match.userAId

      const profile = await prisma.profile.findUnique({
        where: { userId: otherUserId },
        include: { user: true }
      })

      const preference = await prisma.preference.findUnique({
        where: { userId: otherUserId }
      })

      // Get last message from conversation if exists
      const conversation = await prisma.conversation.findUnique({
        where: { matchId: match.id },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })

      return {
        id: match.id,
        matchedAt: match.createdAt,
        createdAt: match.createdAt,
        otherUser: profile ? {
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
        } : null,
        compatibility: 85, // Could calculate from preferences
        lastMessage: conversation?.messages[0]?.content || null,
        conversationId: conversation?.id || null,
      }
    })
  )

  return enrichedMatches.filter(m => m.otherUser !== null)
}

function generateMatchTags(profile, preference) {
  const tags = []
  if (profile?.hasRoom) tags.push('Has Room')
  if (preference?.pets) tags.push('Pet Friendly')
  if (!preference?.smoking) tags.push('Non-Smoker')
  if (profile?.occupation) tags.push(profile.occupation)
  return tags.slice(0, 3)
}

module.exports = {
  checkAndCreateMatch,
  getMyMatches
}
