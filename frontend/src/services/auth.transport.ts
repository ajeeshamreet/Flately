import type { AuthSession, User } from '@/types'
import { apiRequest } from '@/services/api'
import { runtimeConfig } from '@/config/runtimeConfig'

type Credentials = {
  email: string
  password: string
}

export function signInWithPassword(payload: Credentials): Promise<AuthSession> {
  return apiRequest<AuthSession>({
    method: 'POST',
    url: '/auth/login',
    data: payload,
  })
}

export function signUpWithPassword(payload: Credentials & { name?: string }): Promise<AuthSession> {
  return apiRequest<AuthSession>({
    method: 'POST',
    url: '/auth/signup',
    data: payload,
  })
}

export function getGoogleAuthStartUrl(source?: string): string {
  const url = new URL('/auth/google/start', runtimeConfig.apiBaseUrl)

  if (source) {
    url.searchParams.set('source', source)
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    url.searchParams.set('redirectOrigin', window.location.origin)
  }

  return url.toString()
}

export function exchangeGoogleAuthCode(code: string): Promise<AuthSession> {
  return apiRequest<AuthSession>({
    method: 'GET',
    url: '/auth/google/exchange',
    params: {
      code,
    },
  })
}

export function getCurrentUser(): Promise<User> {
  return apiRequest<User>({
    method: 'GET',
    url: '/users/me',
  })
}
