import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { getOrCreateUser } from './users.service';

export async function getUserProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const payload = req.auth?.payload;

    if (!payload?.sub) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await getOrCreateUser({
      auth0Id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });

    res.json(user);
  } catch (error: unknown) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
