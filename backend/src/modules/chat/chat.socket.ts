import { Server } from 'socket.io';
import { sendMessage } from './chat.service';
import { ClientToServerEvents, ServerToClientEvents, SendMessagePayload } from '../../types/socket';

const chatSocketEvents = {
  joinCanonical: 'joinRoom',
  joinAlias: 'join',
  sendCanonical: 'sendMessage',
  sendAlias: 'send_message',
  messageCanonical: 'message',
  messageAlias: 'new_message',
} as const;

export default function registerChatSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
): void {
  io.on('connection', (socket) => {
    const joinConversation = (conversationId: string) => {
      socket.join(conversationId);
    };

    const handleSendMessage = async ({ conversationId, senderId, content }: SendMessagePayload) => {
      const msg = await sendMessage(conversationId, senderId, content);
      const payload = {
        id: msg.id,
        senderId: msg.senderId,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
        timestamp: msg.createdAt.toISOString(),
      };

      io.to(conversationId).emit(chatSocketEvents.messageCanonical, payload);
      io.to(conversationId).emit(chatSocketEvents.messageAlias, payload);
    };

    socket.on(chatSocketEvents.joinCanonical, joinConversation);
    socket.on(chatSocketEvents.joinAlias, joinConversation);

    socket.on(chatSocketEvents.sendCanonical, handleSendMessage);
    socket.on(chatSocketEvents.sendAlias, handleSendMessage);
  });
}
