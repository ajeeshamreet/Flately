import type { Match } from '@/types'
import { apiRequest } from '@/services/api'

export function getMyMatches(): Promise<Match[]> {
  return apiRequest<Match[]>({
    method: 'GET',
    url: '/matches/me',
  })
}

export function connectWithUser(
  toUserId: string,
): Promise<{ success: boolean; matched: boolean }> {
  return apiRequest<{ success: boolean; matched: boolean }>({
    method: 'POST',
    url: `/matches/connect/${toUserId}`,
  })
}
