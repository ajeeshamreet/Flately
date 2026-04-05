import type { OpenChatResponse } from '@/types'
import { apiRequest } from '@/services/api'

export function openChat(matchId: string): Promise<OpenChatResponse> {
  return apiRequest<OpenChatResponse>({
    method: 'GET',
    url: `/chat/${matchId}`,
  })
}
