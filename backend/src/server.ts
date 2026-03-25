import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import registerChatSocket from './modules/chat/chat.socket';
import { ClientToServerEvents, ServerToClientEvents } from './types/socket';

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: '*',
  },
});

registerChatSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server + Socket running on port ${PORT}`);
});
