import type { ChatMessage, OpenChatResponse } from '@/types'

export function mergeIncomingMessage(
  previous: OpenChatResponse | null,
  conversationId: string,
  payload: ChatMessage,
): OpenChatResponse | null {
  if (!previous || previous.conversation.id !== conversationId) {
    return previous
  }

  if (previous.messages.some((message) => message.id === payload.id)) {
    return previous
  }

  return {
    ...previous,
    messages: [...previous.messages, payload],
  }
}