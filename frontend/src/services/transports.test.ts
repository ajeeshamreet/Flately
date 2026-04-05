import { beforeEach, describe, expect, it, vi } from 'vitest'
import { openChat } from '@/services/chat.transport'
import { getDiscoveryFeed, swipeDiscoveryUser } from '@/services/discovery.transport'
import { connectWithUser, getMyMatches } from '@/services/matches.transport'
import { apiRequest } from '@/services/api'

vi.mock('@/services/api', () => ({
  apiRequest: vi.fn(),
}))

describe('transport contracts', () => {
  const apiRequestMock = vi.mocked(apiRequest)

  beforeEach(() => {
    apiRequestMock.mockReset()
    apiRequestMock.mockResolvedValue({} as never)
  })

  it('loads discovery feed from the expected endpoint', async () => {
    await getDiscoveryFeed()

    expect(apiRequestMock).toHaveBeenCalledWith({
      method: 'GET',
      url: '/discovery/feed',
    })
  })

  it('submits a discovery swipe action', async () => {
    await swipeDiscoveryUser({ toUserId: 'user-2', action: 'dislike' })

    expect(apiRequestMock).toHaveBeenCalledWith({
      method: 'POST',
      url: '/discovery/swipe',
      data: {
        toUserId: 'user-2',
        action: 'dislike',
      },
    })
  })

  it('loads matches and opens direct connect', async () => {
    await getMyMatches()
    await connectWithUser('user-9')

    expect(apiRequestMock).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/matches/me',
    })

    expect(apiRequestMock).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      url: '/matches/connect/user-9',
    })
  })

  it('opens chat by match id', async () => {
    await openChat('match-4')

    expect(apiRequestMock).toHaveBeenCalledWith({
      method: 'GET',
      url: '/chat/match-4',
    })
  })
})
