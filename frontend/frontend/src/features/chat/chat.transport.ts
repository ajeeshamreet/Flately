import { apiRequest } from '@/services/api';
import {
  joinConversationRoom,
  sendConversationMessage,
  subscribeToIncomingMessages,
} from './socket';

type TokenGetter = () => Promise<string>;

const chatRoutes = {
  myMatches: '/matches/me',
  conversation: (matchId: string) => `/chat/${matchId}`,
} as const;

export async function fetchMyMatches(getToken: TokenGetter) {
  return apiRequest(chatRoutes.myMatches, {}, getToken);
}

export async function openConversation(matchId: string, getToken: TokenGetter) {
  return apiRequest(chatRoutes.conversation(matchId), {}, getToken);
}

export function joinChatRoom(conversationId: string) {
  joinConversationRoom(conversationId);
}

export function onChatMessage(handler) {
  return subscribeToIncomingMessages(handler);
}

export function sendChatMessage(payload) {
  sendConversationMessage(payload);
}
