import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

type ProtectedRouteProps = PropsWithChildren<{
  allowIncompleteProfile?: boolean
}>

export function ProtectedRoute({ children, allowIncompleteProfile = false }: ProtectedRouteProps) {
  const authStatus = useAppSelector((state) => state.auth.status)
  const profile = useAppSelector((state) => state.profile.data)
  const profileInitialized = useAppSelector((state) => state.profile.initialized)
  const profileLoading = useAppSelector((state) => state.profile.loading)
  const profileError = useAppSelector((state) => state.profile.error)

  if (authStatus === 'loading') {
    return <p className="text-sm text-slate-500">Checking session...</p>
  }

  if (authStatus !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  if (allowIncompleteProfile) {
    return children
  }

  if (profileError) {
    return (
      <section className="mx-auto mt-12 max-w-xl rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-700">
        <h2 className="text-lg font-semibold">Unable to load your profile</h2>
        <p className="mt-2 text-sm">{profileError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-md border border-rose-300 px-3 py-2 text-sm font-semibold hover:bg-rose-100"
        >
          Retry
        </button>
      </section>
    )
  }

  if (!profileInitialized || profileLoading) {
    return <p className="text-sm text-slate-500">Loading profile...</p>
  }

  if (!profile || !profile.onboardingCompleted) {
    return <Navigate to="/app/onboarding" replace />
  }

  return children
}
