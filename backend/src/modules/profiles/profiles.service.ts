import prisma from '../../config/prisma';

type ProfileUpdateData = Parameters<typeof prisma.profile.update>[0]['data'];

export async function getProfileByUserId(userId: string) {
  return prisma.profile.findUnique({ where: { userId } });
}

export async function createOrUpdateProfile(userId: string, data: ProfileUpdateData) {
  const existing = await prisma.profile.findUnique({ where: { userId } });

  if (existing) {
    return prisma.profile.update({ where: { userId }, data });
  }

  return prisma.profile.create({
    data: {
      ...(data as Record<string, unknown>),
      userId,
    } as Parameters<typeof prisma.profile.create>[0]['data'],
  });
}
