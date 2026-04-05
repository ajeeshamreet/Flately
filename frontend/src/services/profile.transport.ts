import type { Profile } from '@/types'
import { apiRequest } from '@/services/api'

export function getMyProfile(): Promise<Profile | null> {
  return apiRequest<Profile | null>({
    method: 'GET',
    url: '/profiles/me',
  })
}

type ProfilePayload = Partial<
  Omit<
    Profile,
    'id' | 'userId' | 'onboardingCompleted' | 'createdAt' | 'updatedAt'
  > & {
    onboardingCompleted: boolean
  }
>

export function saveMyProfile(payload: ProfilePayload): Promise<Profile> {
  return apiRequest<Profile>({
    method: 'POST',
    url: '/profiles/me',
    data: payload,
  })
}
