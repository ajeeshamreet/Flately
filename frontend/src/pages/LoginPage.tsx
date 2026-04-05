import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { signIn, isLoading, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const reason = searchParams.get('reason')
  const source = searchParams.get('source')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (reason === 'session-expired') {
      setError('Your session expired. Please sign in again.')
      const nextSearchParams = new URLSearchParams(searchParams)
      nextSearchParams.delete('reason')
      setSearchParams(nextSearchParams, { replace: true })
    }
  }, [reason, searchParams, setSearchParams])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      await signIn(email, password)
      navigate('/app', { replace: true })
    } catch (submitError) {
      setError((submitError as Error).message || 'Unable to sign in')
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute left-[-15%] top-[-30%] h-130 w-130 rounded-full bg-[radial-gradient(circle,rgba(15,76,92,0.18),rgba(15,76,92,0))]" />
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-6 py-10 lg:grid-cols-[1fr_440px]">
        <section className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Flately Access</p>
          <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-tight text-slate-900">
            Sign in and pick up your roommate search where you left off.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            Your profile, preferences, matches, and conversations stay connected to one secure account.
          </p>
        </section>

        <form
          className="w-full rounded-2xl border border-neutral-border bg-surface p-6 shadow-[0_28px_70px_-50px_rgba(15,76,92,0.55)] md:p-8"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-600">Sign in with your email and password.</p>

          {source === 'questionnaire' ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Questionnaire answers were saved. Sign in to continue with onboarding prefill.
            </div>
          ) : null}

          <label htmlFor="login-email" className="mt-6 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="name@email.com"
          />

          <label htmlFor="login-password" className="mt-4 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Enter your password"
          />

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="mt-5 text-sm text-slate-600">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:text-primary-dark">
              Create an account
            </Link>
          </p>

          {source === 'questionnaire' ? (
            <p className="mt-2 text-sm text-slate-600">
              Need to edit answers first?{' '}
              <Link to="/start" className="font-semibold text-primary hover:text-primary-dark">
                Return to questionnaire
              </Link>
            </p>
          ) : null}
        </form>
      </div>
    </div>
  )
}
