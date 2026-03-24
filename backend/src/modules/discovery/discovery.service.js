const prisma = require("../../config/prisma");

const { checkAndCreateMatch } = require("../matches/matches.service");
const { findMatchesForUser } = require("../matching/matching.service");

async function getDiscoveryFeed(userId) {
  // Get already swiped users
  const swipes = await prisma.swipe.findMany({
    where: { fromUserId: userId },
    select: { toUserId: true }
  })

  const excludedUserIds = swipes.map(s => s.toUserId)

  // Get matches with scores
  const matches = await findMatchesForUser(userId)
  const filtered = matches.filter(m => !excludedUserIds.includes(m.userId))

  // Fetch full profile data for each match
  const enrichedProfiles = await Promise.all(
    filtered.map(async (match) => {
      const profile = await prisma.profile.findUnique({
        where: { userId: match.userId },
        include: { user: true }
      })
      
      const preference = await prisma.preference.findUnique({
        where: { userId: match.userId }
      })

      if (!profile) return null

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
      }
    })
  )

  return enrichedProfiles.filter(Boolean)
}

// Generate lifestyle tags from profile/preferences
function generateTags(profile, preference) {
  const tags = []
  
  if (profile.hasRoom) tags.push('Has Room')
  if (preference?.pets) tags.push('Pet Friendly')
  if (!preference?.smoking) tags.push('Non-Smoker')
  if (preference?.cleanliness >= 4) tags.push('Clean & Tidy')
  if (preference?.socialLevel >= 4) tags.push('Social')
  if (preference?.socialLevel <= 2) tags.push('Quiet')
  if (preference?.sleepSchedule <= 2) tags.push('Early Bird')
  if (preference?.sleepSchedule >= 4) tags.push('Night Owl')
  if (profile.occupation) tags.push(profile.occupation)
  
  return tags.slice(0, 4) // Max 4 tags
}

async function swipeUser(fromUserId, toUserId, action) {
  const swipe = await prisma.swipe.upsert({
    where: {
      fromUserId_toUserId: {
        fromUserId,
        toUserId
      }
    },
    update: { action },
    create: {
      fromUserId,
      toUserId,
      action
    }
  })

  let matched = false
  if (action === "like") {
    const result = await checkAndCreateMatch(fromUserId, toUserId)
    matched = result?.matched || false
  }
  
  return { swipe, matched }
}

module.exports = {
  getDiscoveryFeed,
  swipeUser
}