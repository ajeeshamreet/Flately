import type { AuthSession, User } from '@/types'
import { apiRequest } from '@/services/api'

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

export function getCurrentUser(): Promise<User> {
  return apiRequest<User>({
    method: 'GET',
    url: '/users/me',
  })
}
