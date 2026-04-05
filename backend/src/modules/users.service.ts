import prisma from '../config/prisma';

interface AuthProfileInput {
  userId?: string;
  email?: string;
  name?: string;
  picture?: string;
}

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

function isObjectId(value: string | undefined): value is string {
  return Boolean(value && OBJECT_ID_PATTERN.test(value));
}

function normalizeEmail(email?: string): string | undefined {
  return email?.trim().toLowerCase();
}

export async function getOrCreateUser(data: AuthProfileInput) {
  const normalizedEmail = normalizeEmail(data.email);

  let user = isObjectId(data.userId)
    ? await prisma.user.findUnique({ where: { id: data.userId } })
    : null;

  if (!user && normalizedEmail) {
    user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  }

  if (!user) {
    if (!normalizedEmail) {
      throw new Error('EMAIL_REQUIRED');
    }

    try {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: data.name ?? null,
          picture: data.picture ?? null,
        },
      });
    } catch (error) {
      const isUniqueEmailError =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002';

      if (!isUniqueEmailError) {
        throw error;
      }

      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user) {
        throw error;
      }
    }
  } else {
    const shouldUpdate =
      user.name !== (data.name ?? user.name) ||
      user.picture !== (data.picture ?? user.picture);

    if (shouldUpdate) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: data.name ?? user.name,
          picture: data.picture ?? user.picture,
        },
      });
    }
  }

  return user;
}
