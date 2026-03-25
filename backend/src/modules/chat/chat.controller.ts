import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../types/auth';
import { getMessages, getOrCreateConversation, validateUserInMatch } from './chat.service';

export async function Openchat(req: AuthRequest, res: Response): Promise<void> {
  const rawMatchId = req.params.matchId;
  const matchId = Array.isArray(rawMatchId) ? rawMatchId[0] : rawMatchId;
  const userId = req.userId;

  if (!userId || !matchId) {
    res.status(400).json({ message: 'Invalid request' });
    return;
  }

  const allowed = await validateUserInMatch(matchId, userId);
  if (!allowed) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  const convo = await getOrCreateConversation(matchId);
  const messages = await getMessages(convo.id);

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    res.status(404).json({ message: 'Match not found' });
    return;
  }

  const otherUserId = match.userAId === userId ? match.userBId : match.userAId;

  const otherProfile = await prisma.profile.findUnique({
    where: { userId: otherUserId },
    include: { user: true },
  });

  res.json({
    conversation: convo,
    messages,
    otherUser: otherProfile
      ? {
          id: otherUserId,
          name: otherProfile.user?.name || 'Anonymous',
          picture: otherProfile.user?.picture,
          city: otherProfile.city,
          occupation: otherProfile.occupation,
        }
      : null,
  });
}
