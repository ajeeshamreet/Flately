import { apiRequest } from '@/services/api';

type TokenGetter = () => Promise<string>;

const discoveryRoutes = {
  feed: '/discovery/feed',
  swipe: '/discovery/swipe',
} as const;

export async function fetchDiscoveryFeed(getToken: TokenGetter) {
  return apiRequest(discoveryRoutes.feed, {}, getToken);
}

export async function connectToProfile(toUserId: string, getToken: TokenGetter) {
  return apiRequest(
    discoveryRoutes.swipe,
    {
      method: 'POST',
      data: {
        toUserId,
        action: 'like',
      },
    },
    getToken,
  );
}
