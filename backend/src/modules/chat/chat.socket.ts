import { Server } from 'socket.io';
import { sendMessage } from './chat.service';
import { ClientToServerEvents, ServerToClientEvents, SendMessagePayload } from '../../types/socket';

export default function registerChatSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
): void {
  io.on('connection', (socket) => {
    socket.on('join', (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on('send_message', async ({ conversationId, senderId, content }: SendMessagePayload) => {
      const msg = await sendMessage(conversationId, senderId, content);
      io.to(conversationId).emit('new_message', {
        id: msg.id,
        senderId: msg.senderId,
        content: msg.content,
        timestamp: msg.createdAt,
      });
    });
  });
}
