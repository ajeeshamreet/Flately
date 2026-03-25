import prisma from '../config/prisma';

interface Auth0ProfileInput {
  auth0Id: string;
  email?: string;
  name?: string;
  picture?: string;
}

export async function getOrCreateUser(data: Auth0ProfileInput) {
  let user = await prisma.user.findUnique({ where: { auth0id: data.auth0Id } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        auth0id: data.auth0Id,
        email: data.email ?? '',
        name: data.name ?? '',
        picture: data.picture ?? '',
      },
    });
  }

  return user;
}
