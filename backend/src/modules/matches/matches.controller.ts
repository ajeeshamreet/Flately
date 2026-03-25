import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { getMyMatches as getMyMatchesService } from './matches.service';

export async function getMyMatches(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const matches = await getMyMatchesService(userId);
  res.json(matches);
}
