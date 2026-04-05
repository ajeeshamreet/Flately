import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../../config/prisma';
import env from '../../config/env';

type AuthSession = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
  };
};

type EmailCredentials = {
  email: string;
  password: string;
  name?: string;
};

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function signAccessToken(user: SessionUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
  };

  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

function toSession(user: SessionUser): AuthSession {
  return {
    accessToken: signAccessToken(user),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  };
}

export async function signUpWithEmail(credentials: EmailCredentials): Promise<AuthSession> {
  const email = normalizeEmail(credentials.email);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const passwordHash = await bcrypt.hash(credentials.password, 10);

  let user;

  try {
    user = await prisma.user.create({
      data: {
        email,
        name: credentials.name?.trim() || null,
        passwordHash,
        picture: null,
      },
    });
  } catch (error) {
    const isUniqueError =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002';

    if (!isUniqueError) {
      throw error;
    }

    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    throw new Error('AUTH_STORAGE_CONFLICT');
  }

  return toSession(user);
}

export async function signInWithEmail(credentials: EmailCredentials): Promise<AuthSession> {
  const email = normalizeEmail(credentials.email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('INVALID_CREDENTIALS');
  }

  return toSession(user);
}
