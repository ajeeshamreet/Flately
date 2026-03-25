import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { getPreferences, savePreferences } from './preferences.service';

export async function getMyPreferences(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const prefs = await getPreferences(userId);
  res.json(prefs);
}

export async function saveMyPreferences(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const prefs = await savePreferences(
      userId,
      req.body as Parameters<typeof savePreferences>[1],
    );
    res.json(prefs);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INVALID_WEIGHTS') {
      res.status(400).json({ error: 'Weights must sum to 100' });
      return;
    }

    res.status(500).json({ message: 'Failed to save preferences' });
  }
}
