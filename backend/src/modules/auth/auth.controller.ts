import { Request, Response } from 'express';
import env from '../../config/env';
import {
  completeGoogleAuthorization,
  consumeGoogleExchangeCode,
  getGoogleAuthorizationUrl,
  signInWithEmail,
  signUpWithEmail,
} from './auth.service';

function getErrorStatus(errorCode: string): number {
  switch (errorCode) {
    case 'EMAIL_ALREADY_EXISTS':
      return 409;
    case 'INVALID_CREDENTIALS':
      return 401;
    case 'AUTH_STORAGE_CONFLICT':
      return 500;
    default:
      return 500;
  }
}

function sendError(res: Response, error: unknown, fallback: string): void {
  const code = error instanceof Error ? error.message : fallback;
  const status = getErrorStatus(code);

  if (status === 500) {
    console.error(fallback, error);
  }

  res.status(status).json({
    error: code,
  });
}

function resolveFrontendBaseUrl(redirectOrigin?: string): string {
  if (redirectOrigin) {
    return redirectOrigin;
  }

  return env.FRONTEND_URL;
}

function redirectToLoginWithError(
  res: Response,
  errorCode: string,
  source?: string,
  redirectOrigin?: string,
): void {
  const loginUrl = new URL('/login', resolveFrontendBaseUrl(redirectOrigin));
  loginUrl.searchParams.set('error', errorCode);

  if (source) {
    loginUrl.searchParams.set('source', source);
  }

  res.redirect(loginUrl.toString());
}

export async function signup(req: Request, res: Response): Promise<void> {
  const body = req.body as { email?: string; password?: string; name?: string };

  if (!body.email || !body.password) {
    res.status(400).json({ error: 'EMAIL_AND_PASSWORD_REQUIRED' });
    return;
  }

  if (body.password.length < 8) {
    res.status(400).json({ error: 'PASSWORD_TOO_SHORT' });
    return;
  }

  try {
    const session = await signUpWithEmail({
      email: body.email,
      password: body.password,
      name: body.name,
    });

    res.status(201).json(session);
  } catch (error) {
    sendError(res, error, 'Error in signup');
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = req.body as { email?: string; password?: string };

  if (!body.email || !body.password) {
    res.status(400).json({ error: 'EMAIL_AND_PASSWORD_REQUIRED' });
    return;
  }

  try {
    const session = await signInWithEmail({
      email: body.email,
      password: body.password,
    });

    res.json(session);
  } catch (error) {
    sendError(res, error, 'Error in login');
  }
}

export function startGoogleAuth(req: Request, res: Response): void {
  const source = typeof req.query.source === 'string' ? req.query.source : undefined;
  const redirectOrigin =
    typeof req.query.redirectOrigin === 'string' ? req.query.redirectOrigin : undefined;

  try {
    const authorizationUrl = getGoogleAuthorizationUrl(source, redirectOrigin);
    res.redirect(authorizationUrl);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'GOOGLE_AUTH_INIT_FAILED';

    if (code === 'GOOGLE_OAUTH_NOT_CONFIGURED') {
      redirectToLoginWithError(res, code, source, redirectOrigin);
      return;
    }

    console.error('Error in startGoogleAuth:', error);
    res.status(500).json({ error: 'GOOGLE_AUTH_INIT_FAILED' });
  }
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';

  if (!code || !state) {
    redirectToLoginWithError(res, 'GOOGLE_CALLBACK_INVALID');
    return;
  }

  try {
    const result = await completeGoogleAuthorization(code, state);
    const callbackUrl = new URL('/auth/callback', resolveFrontendBaseUrl(result.redirectOrigin));
    callbackUrl.searchParams.set('code', result.exchangeCode);

    if (result.source) {
      callbackUrl.searchParams.set('source', result.source);
    }

    res.redirect(callbackUrl.toString());
  } catch (error) {
    const errorCode = error instanceof Error ? error.message : 'GOOGLE_AUTH_FAILED';
    const source = typeof req.query.source === 'string' ? req.query.source : undefined;

    if (errorCode === 'GOOGLE_STATE_INVALID') {
      redirectToLoginWithError(res, errorCode, source);
      return;
    }

    if (
      errorCode === 'GOOGLE_TOKEN_EXCHANGE_FAILED' ||
      errorCode === 'GOOGLE_USERINFO_FETCH_FAILED' ||
      errorCode === 'GOOGLE_EMAIL_NOT_VERIFIED' ||
      errorCode === 'GOOGLE_OAUTH_NOT_CONFIGURED'
    ) {
      redirectToLoginWithError(res, errorCode, source);
      return;
    }

    console.error('Error in googleCallback:', error);
    redirectToLoginWithError(res, 'GOOGLE_AUTH_FAILED', source);
  }
}

export function exchangeGoogleCode(req: Request, res: Response): void {
  const code = typeof req.query.code === 'string' ? req.query.code : '';

  if (!code) {
    res.status(400).json({ error: 'GOOGLE_EXCHANGE_CODE_REQUIRED' });
    return;
  }

  try {
    const session = consumeGoogleExchangeCode(code);
    res.json(session);
  } catch (error) {
    const errorCode = error instanceof Error ? error.message : 'GOOGLE_EXCHANGE_FAILED';

    if (errorCode === 'GOOGLE_EXCHANGE_CODE_INVALID') {
      res.status(400).json({ error: errorCode });
      return;
    }

    console.error('Error in exchangeGoogleCode:', error);
    res.status(500).json({ error: 'GOOGLE_EXCHANGE_FAILED' });
  }
}
