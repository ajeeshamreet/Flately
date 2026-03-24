const prisma = require("../../config/prisma");

async function getOrCreateConversation(matchId) {
  return prisma.conversation.upsert({
    where: { matchId },
    update: {},
    create: { matchId }
  });
}
async function getMessages(conversationId) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" }
  });
}
async function sendMessage(conversationId, senderId, content) {
  return prisma.message.create({
    data: {
      conversationId,
      senderId,
      content
    }
  });
}
async function validateUserInMatch(matchId , userId){
    const match = await prisma.match.findUnique({
        where : { id : matchId}
    });
    if (!match){
        return false;
    }
    return (match.userAId === userId || match.userBId === userId);
}

module.exports = {
    getOrCreateConversation,
    getMessages,
    sendMessage,
    validateUserInMatch
    };