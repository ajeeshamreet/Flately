import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { getOrCreateUser } from './users.service';

export async function getUserProfile(req: AuthRequest, res: Response): Promise<void> {
  const payload = req.auth?.payload;
  const userId = req.userId as string;

  const user = await getOrCreateUser({
    auth0Id: userId,
    email: payload?.email,
    name: payload?.name,
    picture: payload?.picture,
  });

  res.json(user);
}
