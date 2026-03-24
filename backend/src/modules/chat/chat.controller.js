const prisma = require("../../config/prisma");
const chatService = require("./chat.service");

async function Openchat(req, res) {
  const { matchId } = req.params;
  const userId = req.userId;

  const allowed = await chatService.validateUserInMatch(matchId, userId);

  if (!allowed) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const convo = await chatService.getOrCreateConversation(matchId);
  const messages = await chatService.getMessages(convo.id);

  // Get the match to find the other user
  const match = await prisma.match.findUnique({
    where: { id: matchId }
  });

  const otherUserId = match.userAId === userId ? match.userBId : match.userAId;

  // Get other user's profile
  const otherProfile = await prisma.profile.findUnique({
    where: { userId: otherUserId },
    include: { user: true }
  });

  res.json({
    conversation: convo,
    messages,
    otherUser: otherProfile ? {
      id: otherUserId,
      name: otherProfile.user?.name || 'Anonymous',
      picture: otherProfile.user?.picture,
      city: otherProfile.city,
      occupation: otherProfile.occupation,
    } : null
  });
}

module.exports = { Openchat }
