const prisma = require("../../config/prisma");

async function getProfileByUserId(userId) {
  return prisma.profile.findUnique({
    where: { userId }
  });
}

async function createOrUpdateProfile(userId, data) {
  const existing = await prisma.profile.findUnique({
    where: { userId }
  });

  if (existing) {
    return prisma.profile.update({
      where: { userId },
      data
    });
  }

  return prisma.profile.create({
    data: {
      ...data,
      userId
    }
  });
}

module.exports = {
  getProfileByUserId,
  createOrUpdateProfile
};
