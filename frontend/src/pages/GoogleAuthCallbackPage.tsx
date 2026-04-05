import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { formatAuthError, formatAuthErrorCode } from '@/features/auth/auth.error'

export function GoogleAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { completeGoogleSignIn, isAuthenticated } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true })
      return
    }

    const exchangeCodeParam = searchParams.get('code')
    const callbackError = searchParams.get('error')

    if (callbackError) {
      setError(formatAuthErrorCode(callbackError, 'Google sign-in failed.'))
      return
    }

    if (!exchangeCodeParam) {
      setError(formatAuthErrorCode('GOOGLE_CALLBACK_INVALID'))
      return
    }

    const exchangeCode = exchangeCodeParam

    let cancelled = false

    async function finalizeGoogleSignIn(): Promise<void> {
      try {
        await completeGoogleSignIn(exchangeCode)
        if (!cancelled) {
          navigate('/app', { replace: true })
        }
      } catch (exchangeError) {
        if (!cancelled) {
          setError(formatAuthError(exchangeError, 'Google sign-in failed.'))
        }
      }
    }

    void finalizeGoogleSignIn()

    return () => {
      cancelled = true
    }
  }, [completeGoogleSignIn, isAuthenticated, navigate, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-border bg-surface p-7 shadow-[0_28px_70px_-50px_rgba(15,76,92,0.55)]">
        <h1 className="text-2xl font-semibold text-slate-900">Completing Google sign-in</h1>
        <p className="mt-3 text-sm text-slate-600">
          We are securing your session and loading your account details.
        </p>

        {error ? (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Please wait a moment...
          </div>
        )}

        <div className="mt-5">
          <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-dark">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
