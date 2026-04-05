import { mergeIncomingMessage } from '@/features/chat/chat.messages'
import type { ChatMessage, OpenChatResponse } from '@/types'

function createChatData(): OpenChatResponse {
  return {
    conversation: {
      id: 'conv-1',
      matchId: 'match-1',
      createdAt: '2026-04-05T00:00:00.000Z',
    },
    messages: [
      {
        id: 'm-1',
        senderId: 'user-1',
        content: 'hello',
        createdAt: '2026-04-05T00:00:00.000Z',
      },
    ],
    otherUser: {
      id: 'user-2',
      name: 'Taylor',
    },
  }
}

describe('mergeIncomingMessage', () => {
  it('appends a new message for the active conversation', () => {
    const payload: ChatMessage = {
      id: 'm-2',
      senderId: 'user-2',
      content: 'hey back',
      createdAt: '2026-04-05T00:01:00.000Z',
    }

    const next = mergeIncomingMessage(createChatData(), 'conv-1', payload)

    expect(next?.messages).toHaveLength(2)
    expect(next?.messages[1]?.id).toBe('m-2')
  })

  it('ignores duplicate message ids', () => {
    const payload: ChatMessage = {
      id: 'm-1',
      senderId: 'user-2',
      content: 'duplicate',
      createdAt: '2026-04-05T00:01:00.000Z',
    }

    const next = mergeIncomingMessage(createChatData(), 'conv-1', payload)

    expect(next?.messages).toHaveLength(1)
  })

  it('ignores messages for other conversations', () => {
    const payload: ChatMessage = {
      id: 'm-3',
      senderId: 'user-2',
      content: 'foreign room',
      createdAt: '2026-04-05T00:01:00.000Z',
    }

    const next = mergeIncomingMessage(createChatData(), 'conv-2', payload)

    expect(next?.messages).toHaveLength(1)
    expect(next?.messages[0]?.id).toBe('m-1')
  })
})
