import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { findMatches } from './matching.service';

export async function getMatches(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId as string;
  const matches = await findMatches(userId);
  res.json(matches);
}
