import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { swipeUser } from '../discovery/discovery.service';
import { getMyMatches as getMyMatchesService } from './matches.service';

export async function getMyMatches(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId as string;

  const matches = await getMyMatchesService(userId);
  res.json(matches);
}

export async function connectCompatibility(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId as string;

  const rawToUserId = req.params.toUserId;
  const toUserId = Array.isArray(rawToUserId) ? rawToUserId[0] : rawToUserId;

  if (!toUserId) {
    res.status(400).json({ message: 'Invalid target user' });
    return;
  }

  const result = await swipeUser(userId, toUserId, 'like');
  res.json({ success: true, matched: result.matched });
}
