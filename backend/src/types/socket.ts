export interface ServerToClientEvents {
  message: (data: MessagePayload) => void;
  userOnline: (userId: string) => void;
  userOffline: (userId: string) => void;
  new_message: (data: MessagePayload) => void;
}

export interface ClientToServerEvents {
  sendMessage: (data: SendMessagePayload) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  send_message: (data: SendMessagePayload) => void;
  join: (conversationId: string) => void;
}

export interface MessagePayload {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content: string;
}
