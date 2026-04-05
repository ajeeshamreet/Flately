import { toApiErrorMessage } from '@/services/api'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_AND_PASSWORD_REQUIRED: 'Please enter both email and password.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  AUTH_STORAGE_CONFLICT: 'Could not create your account right now. Please try again.',
  GOOGLE_OAUTH_NOT_CONFIGURED: 'Google sign-in is not configured in this environment yet.',
  GOOGLE_CALLBACK_INVALID: 'Google sign-in callback is invalid. Please try again.',
  GOOGLE_STATE_INVALID: 'Google sign-in session expired. Please try again.',
  GOOGLE_TOKEN_EXCHANGE_FAILED: 'Google sign-in failed during token exchange. Please retry.',
  GOOGLE_USERINFO_FETCH_FAILED: 'Google sign-in could not fetch your profile. Please retry.',
  GOOGLE_EMAIL_NOT_VERIFIED: 'Your Google email must be verified before signing in.',
  GOOGLE_AUTH_FAILED: 'Google sign-in failed. Please try again.',
  GOOGLE_AUTH_INIT_FAILED: 'Could not start Google sign-in. Please try again.',
  GOOGLE_EXCHANGE_CODE_REQUIRED: 'Missing Google exchange code. Please retry sign-in.',
  GOOGLE_EXCHANGE_CODE_INVALID: 'Google sign-in code expired. Please try again.',
  GOOGLE_EXCHANGE_FAILED: 'Google sign-in could not be completed. Please retry.',
}

export function formatAuthErrorCode(code: string, fallback = 'Unable to continue.'): string {
  if (!code.trim()) {
    return fallback
  }

  const normalized = code.trim().toUpperCase()

  if (AUTH_ERROR_MESSAGES[normalized]) {
    return AUTH_ERROR_MESSAGES[normalized]
  }

  if (normalized.includes('401')) {
    return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS
  }

  return code
}

export function formatAuthError(error: unknown, fallback = 'Unable to continue.'): string {
  const code = toApiErrorMessage(error, fallback)
  return formatAuthErrorCode(code, fallback)
}
