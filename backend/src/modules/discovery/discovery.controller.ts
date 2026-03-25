import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { getDiscoveryFeed, swipeUser } from './discovery.service';

function isSwipeAction(value: unknown): value is 'like' | 'dislike' {
  // Accept 'skip' from frontend and treat as 'dislike'
  return value === 'like' || value === 'dislike' || value === 'skip' || value === 'superlike';
}

export async function getFeed(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const feed = await getDiscoveryFeed(userId);
  res.json(feed);
}

export async function swipe(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const toUserId = body.toUserId;
  const action = body.action;

  if (typeof toUserId !== 'string' || !isSwipeAction(action)) {
    res.status(400).json({ error: 'Invalid action' });
    return;
  }

  await swipeUser(userId, toUserId, action);
  res.json({ success: true });
}
