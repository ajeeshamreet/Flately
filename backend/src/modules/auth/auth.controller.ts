import { Request, Response } from 'express';
import { signInWithEmail, signUpWithEmail } from './auth.service';

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
