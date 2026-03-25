import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { findMatches } from './matching.service';

export async function getMatches(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const matches = await findMatches(userId);
    res.json(matches);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'PROFILE_OR_PREFERENCES_MISSING') {
      res.status(400).json({ message: 'Complete profile and preferences first' });
      return;
    }

    res.status(500).json({ message: 'Matching failed' });
  }
}
