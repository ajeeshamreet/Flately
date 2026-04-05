import type { DiscoveryProfile, SwipeAction } from '@/types'
import { apiRequest } from '@/services/api'

export function getDiscoveryFeed(): Promise<DiscoveryProfile[]> {
  return apiRequest<DiscoveryProfile[]>({
    method: 'GET',
    url: '/discovery/feed',
  })
}

export function swipeDiscoveryUser(payload: {
  toUserId: string
  action: SwipeAction
}): Promise<{ success: boolean; matched?: boolean }> {
  return apiRequest<{ success: boolean; matched?: boolean }>({
    method: 'POST',
    url: '/discovery/swipe',
    data: payload,
  })
}
