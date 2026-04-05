import { useEffect, type PropsWithChildren } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  clearProfile,
  setProfile,
  setProfileError,
  setProfileLoading,
} from '@/features/profile/profileSlice'
import { getMyProfile } from '@/services/profile.transport'
import { setAccessTokenGetter } from '@/services/api'

const PROFILE_BOOTSTRAP_TIMEOUT_MS = 12000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error('Profile bootstrap timed out. Please retry.'))
    }, timeoutMs)

    promise
      .then((result) => {
        window.clearTimeout(timer)
        resolve(result)
      })
      .catch((error) => {
        window.clearTimeout(timer)
        reject(error)
      })
  })
}

export function AuthBootstrap({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const status = useAppSelector((state) => state.auth.status)

  useEffect(() => {
    let cancelled = false

    async function bootstrap(): Promise<void> {
      if (status === 'authenticated' && accessToken) {
        setAccessTokenGetter(() => accessToken)
        dispatch(setProfileLoading(true))
        try {
          const profile = await withTimeout(getMyProfile(), PROFILE_BOOTSTRAP_TIMEOUT_MS)
          if (!cancelled) {
            dispatch(setProfile(profile))
          }
        } catch (error) {
          if (!cancelled) {
            dispatch(
              setProfileError((error as Error).message || 'Failed to load profile. Please retry.'),
            )
          }
        }
      } else {
        if (!cancelled) {
          dispatch(clearProfile())
          setAccessTokenGetter(() => null)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [dispatch, accessToken, status])

  return children
}
