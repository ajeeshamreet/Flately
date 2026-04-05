import type { AuthSession } from '@/types'

export const AUTH_SESSION_STORAGE_KEY = 'flately.auth.session.v1'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!isRecord(value)) {
    return false
  }

  const record = value
  const user = isRecord(record.user) ? record.user : undefined

  return (
    typeof record.accessToken === 'string' &&
    user !== undefined &&
    typeof user?.id === 'string' &&
    typeof user?.email === 'string'
  )
}

export function readPersistedSession(): AuthSession | null {
  if (!isBrowser()) {
    return null
  }

  const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    if (isAuthSession(parsed)) {
      return parsed
    }
  } catch {
    // Ignore corrupt session payloads and treat as signed out.
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
  return null
}

export function persistSession(session: AuthSession): void {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearPersistedSession(): void {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
}