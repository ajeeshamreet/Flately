import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type PropsWithChildren,
} from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  clearSession,
  finishAuthBootstrap,
  setAuthError,
  setAuthLoading,
  setSession,
} from '@/features/auth/authSlice'
import {
  exchangeGoogleAuthCode,
  getGoogleAuthStartUrl,
  signInWithPassword,
  signUpWithPassword,
} from '@/services/auth.transport'
import { setAccessTokenGetter, setUnauthorizedHandler } from '@/services/api'
import {
  clearPersistedSession,
  persistSession,
  readPersistedSession,
} from '@/features/auth/auth.storage'
import { formatAuthError } from '@/features/auth/auth.error'

type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signInWithGoogle: (source?: string) => void
  completeGoogleSignIn: (exchangeCode: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch()
  const { status } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const session = readPersistedSession()

    if (session) {
      dispatch(setSession(session))
      setAccessTokenGetter(() => session.accessToken)
    } else {
      dispatch(finishAuthBootstrap())
    }

    setUnauthorizedHandler(() => {
      clearPersistedSession()
      dispatch(clearSession())

      if (window.location.pathname !== '/login') {
        window.location.assign('/login?reason=session-expired')
      }
    })

    return () => {
      setUnauthorizedHandler(() => undefined)
    }
  }, [dispatch])

  const signIn = useCallback(
    async (email: string, password: string) => {
      dispatch(setAuthLoading())
      try {
        const session = await signInWithPassword({ email, password })
        dispatch(setSession(session))
        persistSession(session)
      } catch (error) {
        dispatch(setAuthError(formatAuthError(error, 'Sign in failed')))
        throw error
      }
    },
    [dispatch],
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      dispatch(setAuthLoading())
      try {
        const session = await signUpWithPassword({ name, email, password })
        dispatch(setSession(session))
        persistSession(session)
      } catch (error) {
        dispatch(setAuthError(formatAuthError(error, 'Sign up failed')))
        throw error
      }
    },
    [dispatch],
  )

  const signInWithGoogle = useCallback((source?: string) => {
    const googleUrl = getGoogleAuthStartUrl(source)
    window.location.assign(googleUrl)
  }, [])

  const completeGoogleSignIn = useCallback(
    async (exchangeCode: string) => {
      dispatch(setAuthLoading())

      try {
        const session = await exchangeGoogleAuthCode(exchangeCode)
        dispatch(setSession(session))
        persistSession(session)
      } catch (error) {
        dispatch(setAuthError(formatAuthError(error, 'Google sign-in failed')))
        throw error
      }
    },
    [dispatch],
  )

  const signOut = useCallback(() => {
    clearPersistedSession()
    dispatch(clearSession())
    setAccessTokenGetter(() => null)
  }, [dispatch])

  const value = useMemo(
    () => ({
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      signIn,
      signUp,
      signInWithGoogle,
      completeGoogleSignIn,
      signOut,
    }),
    [status, signIn, signUp, signInWithGoogle, completeGoogleSignIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
