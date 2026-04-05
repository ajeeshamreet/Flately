import bcrypt from 'bcrypt';
import crypto from 'crypto';
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

type GoogleUserProfile = {
  sub: string;
  email: string;
  name: string | null;
  picture: string | null;
};

type GoogleOAuthStateEntry = {
  expiresAt: number;
  source?: string;
  redirectOrigin?: string;
};

type GoogleExchangeCodeEntry = {
  expiresAt: number;
  session: AuthSession;
};

const GOOGLE_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const GOOGLE_EXCHANGE_CODE_TTL_MS = 2 * 60 * 1000;

const googleOAuthStates = new Map<string, GoogleOAuthStateEntry>();
const googleExchangeCodes = new Map<string, GoogleExchangeCodeEntry>();

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function cleanExpiredGoogleOAuthState(): void {
  const now = Date.now();
  for (const [key, value] of googleOAuthStates.entries()) {
    if (value.expiresAt <= now) {
      googleOAuthStates.delete(key);
    }
  }
}

function cleanExpiredExchangeCodes(): void {
  const now = Date.now();
  for (const [key, value] of googleExchangeCodes.entries()) {
    if (value.expiresAt <= now) {
      googleExchangeCodes.delete(key);
    }
  }
}

function sanitizeSource(source?: string): string | undefined {
  if (typeof source !== 'string') {
    return undefined;
  }

  const trimmed = source.trim().toLowerCase();
  return /^[a-z0-9-]{1,32}$/.test(trimmed) ? trimmed : undefined;
}

function sanitizeRedirectOrigin(origin?: string): string | undefined {
  if (typeof origin !== 'string') {
    return undefined;
  }

  try {
    const url = new URL(origin.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }

    return `${url.protocol}//${url.host}`;
  } catch {
    return undefined;
  }
}

function getGoogleConfig(): {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
} {
  const clientId = env.GOOGLE_OAUTH_CLIENT_ID.trim();
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET.trim();
  const callbackUrl = env.GOOGLE_OAUTH_CALLBACK_URL.trim();

  if (!clientId || !clientSecret || !callbackUrl) {
    throw new Error('GOOGLE_OAUTH_NOT_CONFIGURED');
  }

  return {
    clientId,
    clientSecret,
    callbackUrl,
  };
}

function createGoogleOAuthState(source?: string, redirectOrigin?: string): string {
  cleanExpiredGoogleOAuthState();

  const state = crypto.randomBytes(24).toString('hex');
  googleOAuthStates.set(state, {
    expiresAt: Date.now() + GOOGLE_OAUTH_STATE_TTL_MS,
    source: sanitizeSource(source),
    redirectOrigin: sanitizeRedirectOrigin(redirectOrigin),
  });

  return state;
}

function consumeGoogleOAuthState(state: string): GoogleOAuthStateEntry {
  cleanExpiredGoogleOAuthState();

  const found = googleOAuthStates.get(state);
  googleOAuthStates.delete(state);

  if (!found || found.expiresAt <= Date.now()) {
    throw new Error('GOOGLE_STATE_INVALID');
  }

  return found;
}

function createExchangeCode(session: AuthSession): string {
  cleanExpiredExchangeCodes();

  const code = crypto.randomBytes(24).toString('hex');
  googleExchangeCodes.set(code, {
    expiresAt: Date.now() + GOOGLE_EXCHANGE_CODE_TTL_MS,
    session,
  });

  return code;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

async function fetchGoogleUserProfile(code: string): Promise<GoogleUserProfile> {
  const config = getGoogleConfig();

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.callbackUrl,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('GOOGLE_TOKEN_EXCHANGE_FAILED');
  }

  const tokenPayload = await tokenResponse.json();
  if (!isRecord(tokenPayload)) {
    throw new Error('GOOGLE_TOKEN_EXCHANGE_FAILED');
  }

  const accessToken = readString(tokenPayload, 'access_token');
  if (!accessToken) {
    throw new Error('GOOGLE_TOKEN_EXCHANGE_FAILED');
  }

  const userInfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userInfoResponse.ok) {
    throw new Error('GOOGLE_USERINFO_FETCH_FAILED');
  }

  const userInfoPayload = await userInfoResponse.json();
  if (!isRecord(userInfoPayload)) {
    throw new Error('GOOGLE_USERINFO_FETCH_FAILED');
  }

  const sub = readString(userInfoPayload, 'sub');
  const email = readString(userInfoPayload, 'email');
  const emailVerifiedRaw = userInfoPayload.email_verified;
  const emailVerified = emailVerifiedRaw === true || emailVerifiedRaw === 'true';

  if (!sub || !email) {
    throw new Error('GOOGLE_USERINFO_FETCH_FAILED');
  }

  if (!emailVerified) {
    throw new Error('GOOGLE_EMAIL_NOT_VERIFIED');
  }

  return {
    sub,
    email,
    name: readString(userInfoPayload, 'name') ?? null,
    picture: readString(userInfoPayload, 'picture') ?? null,
  };
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

export function getGoogleAuthorizationUrl(source?: string, redirectOrigin?: string): string {
  const config = getGoogleConfig();
  const state = createGoogleOAuthState(source, redirectOrigin);

  const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorizationUrl.searchParams.set('client_id', config.clientId);
  authorizationUrl.searchParams.set('redirect_uri', config.callbackUrl);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', 'openid email profile');
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('prompt', 'select_account');

  return authorizationUrl.toString();
}

export async function completeGoogleAuthorization(
  code: string,
  state: string,
): Promise<{ exchangeCode: string; source?: string; redirectOrigin?: string }> {
  const stateEntry = consumeGoogleOAuthState(state);
  const googleProfile = await fetchGoogleUserProfile(code);
  const email = normalizeEmail(googleProfile.email);

  const existingByGoogleId = await prisma.user.findFirst({
    where: {
      googleId: googleProfile.sub,
    },
  });

  let user: SessionUser;

  if (existingByGoogleId) {
    user = await prisma.user.update({
      where: {
        id: existingByGoogleId.id,
      },
      data: {
        name: googleProfile.name,
        picture: googleProfile.picture,
      },
    });
  } else {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });

    if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          googleId: googleProfile.sub,
          name: googleProfile.name ?? existingByEmail.name,
          picture: googleProfile.picture ?? existingByEmail.picture,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: null,
          googleId: googleProfile.sub,
          name: googleProfile.name,
          picture: googleProfile.picture,
        },
      });
    }
  }

  const exchangeCode = createExchangeCode(toSession(user));

  return {
    exchangeCode,
    source: stateEntry.source,
    redirectOrigin: stateEntry.redirectOrigin,
  };
}

export function consumeGoogleExchangeCode(code: string): AuthSession {
  cleanExpiredExchangeCodes();

  const entry = googleExchangeCodes.get(code);
  googleExchangeCodes.delete(code);

  if (!entry || entry.expiresAt <= Date.now()) {
    throw new Error('GOOGLE_EXCHANGE_CODE_INVALID');
  }

  return entry.session;
}
