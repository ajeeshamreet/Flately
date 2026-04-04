import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { getPreferences, savePreferences } from './preferences.service';

export async function getMyPreferences(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId as string;
  const prefs = await getPreferences(userId);
  res.json(prefs);
}

export async function saveMyPreferences(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId as string;
  const prefs = await savePreferences(
    userId,
    req.body as Parameters<typeof savePreferences>[1],
  );

  res.json(prefs);
}
