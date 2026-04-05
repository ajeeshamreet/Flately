import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { toApiErrorMessage } from '@/services/api'
import { getDiscoveryFeed } from '@/services/discovery.transport'
import { getMyMatches } from '@/services/matches.transport'
import { getMyPreferences } from '@/services/preferences.transport'
import type { Match, Preference } from '@/types'

type WeightEntry = {
  label: string
  value: number
}

type NextAction = {
  title: string
  description: string
  cta: string
  to: string
}

const WEIGHT_LABELS: Array<{ label: string; key: keyof Pick<Preference, 'weightCleanliness' | 'weightSleep' | 'weightHabits' | 'weightSocial'> }> = [
  { key: 'weightCleanliness', label: 'Cleanliness' },
  { key: 'weightSleep', label: 'Sleep schedule' },
  { key: 'weightHabits', label: 'Habits' },
  { key: 'weightSocial', label: 'Social level' },
]

export function DashboardPage() {
  const profile = useAppSelector((state) => state.profile.data)

  const [reloadToken, setReloadToken] = useState(0)
  const [matches, setMatches] = useState<Match[]>([])
  const [preferences, setPreferences] = useState<Preference | null>(null)
  const [discoveryCount, setDiscoveryCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function retryLoad(): void {
    setReloadToken((value) => value + 1)
  }

  useEffect(() => {
    let cancelled = false

    async function load(): Promise<void> {
      setLoading(true)
      setError(null)

      try {
        const [nextPreferences, nextMatches, feed] = await Promise.allSettled([
          getMyPreferences(),
          getMyMatches(),
          getDiscoveryFeed(),
        ])

        if (cancelled) {
          return
        }

        if (nextPreferences.status === 'fulfilled') {
          setPreferences(nextPreferences.value)
        }

        if (nextMatches.status === 'fulfilled') {
          setMatches(nextMatches.value)
        }

        if (feed.status === 'fulfilled') {
          setDiscoveryCount(feed.value.length)
        }

        const failures: string[] = []

        if (nextPreferences.status === 'rejected') {
          failures.push('preferences')
        }

        if (nextMatches.status === 'rejected') {
          failures.push('matches')
        }

        if (feed.status === 'rejected') {
          failures.push('discovery feed')
        }

        if (failures.length > 0) {
          setError(`Some dashboard data failed to load: ${failures.join(', ')}.`)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(toApiErrorMessage(loadError, 'Failed to load dashboard data'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const profileCompletion = useMemo(() => {
    if (!profile) {
      return 0
    }

    const checks = [
      Boolean(profile.name),
      Boolean(profile.age),
      Boolean(profile.city),
      Boolean(profile.occupation),
      profile.photos.length > 0,
      Boolean(profile.sleepSchedule),
      Boolean(profile.guestPolicy),
      Boolean(profile.smoking),
      Boolean(profile.pets),
    ]

    const completed = checks.filter(Boolean).length
    return Math.round((completed / checks.length) * 100)
  }, [profile])

  const weightSummary: WeightEntry[] = useMemo(() => {
    if (!preferences) {
      return []
    }

    return WEIGHT_LABELS.map((entry) => ({
      label: entry.label,
      value: preferences[entry.key],
    })).sort((a, b) => b.value - a.value)
  }, [preferences])

  const completionBlockers = useMemo(() => {
    const blockers: string[] = []

    if (!profile) {
      blockers.push('Profile not created yet')
      return blockers
    }

    if (!profile.name) blockers.push('Add your name')
    if (!profile.city) blockers.push('Set your city')
    if (!profile.occupation) blockers.push('Select your occupation')
    if (profile.photos.length === 0) blockers.push('Upload at least one photo')
    if (!preferences) blockers.push('Complete roommate preferences')

    return blockers
  }, [profile, preferences])

  const poolHealth = useMemo(() => {
    if (!profile || !preferences) {
      return {
        status: 'Blocked',
        detail: 'Your profile and preferences must be complete before discovery quality can improve.',
      }
    }

    if (discoveryCount === 0) {
      return {
        status: 'Low candidate volume',
        detail: 'No candidates available right now. Broaden city or budget range to increase results.',
      }
    }

    if (discoveryCount < 5) {
      return {
        status: 'Limited candidate volume',
        detail: 'You have some candidates. Expanding one constraint can unlock more options.',
      }
    }

    return {
      status: 'Healthy candidate volume',
      detail: 'Your current settings are producing a solid discovery pool.',
    }
  }, [profile, preferences, discoveryCount])

  const nextAction: NextAction = useMemo(() => {
    if (completionBlockers.length > 0) {
      return {
        title: 'Finish profile prerequisites',
        description: 'Resolve blockers first so matching and chat routes stay reliable.',
        cta: 'Go to onboarding',
        to: '/app/onboarding',
      }
    }

    if (discoveryCount === 0) {
      return {
        title: 'Refine your matching criteria',
        description: 'Adjust preferences to increase eligible candidates in your discovery feed.',
        cta: 'Update profile and preferences',
        to: '/app/profile',
      }
    }

    if (matches.length === 0) {
      return {
        title: 'Start your discovery sprint',
        description: 'Review candidates and send your first like to unlock match conversations.',
        cta: 'Open discovery',
        to: '/app/discover',
      }
    }

    return {
      title: 'Move active matches into conversation',
      description: 'Prioritize your top match and send the first message while intent is high.',
      cta: 'Open matches',
      to: '/app/matches',
    }
  }, [completionBlockers.length, discoveryCount, matches.length])

  if (loading) {
    return <p className="text-sm text-slate-500">Loading dashboard...</p>
  }

  return (
    <section className="space-y-4">
      <header className="rounded-lg border border-neutral-border bg-surface p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Dashboard</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Flow coaching hub</h2>
        <p className="mt-2 text-sm text-slate-600">
          This page shows what blocks your progress, how healthy your candidate pool is, and the
          one next step to improve outcomes.
        </p>
        <button
          type="button"
          onClick={retryLoad}
          className="mt-3 rounded border border-neutral-border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refresh dashboard
        </button>
      </header>

      {error ? (
        <div className="space-y-2 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={retryLoad}
            className="rounded border border-rose-300 px-2 py-1 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-lg border border-neutral-border bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Completion blockers</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{profileCompletion}%</p>
          <p className="mt-1 text-sm text-slate-600">Core readiness for matching flow</p>

          {completionBlockers.length > 0 ? (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {completionBlockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              No blockers detected. Your profile is ready for discovery and matching.
            </p>
          )}

          <Link
            to="/app/onboarding"
            className="mt-4 inline-block rounded border border-neutral-border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Review onboarding answers
          </Link>
        </section>

        <section className="rounded-lg border border-neutral-border bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Eligibility and pool health</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{poolHealth.status}</p>
          <p className="mt-1 text-sm text-slate-600">{poolHealth.detail}</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded border border-neutral-border bg-canvas px-3 py-2">
              <p className="text-xs text-slate-500">Discovery candidates</p>
              <p className="text-2xl font-semibold text-slate-900">{discoveryCount}</p>
            </div>
            <div className="rounded border border-neutral-border bg-canvas px-3 py-2">
              <p className="text-xs text-slate-500">Active matches</p>
              <p className="text-2xl font-semibold text-slate-900">{matches.length}</p>
            </div>
          </div>

          {matches.length > 0 ? (
            <div className="mt-4 space-y-2">
              {matches.slice(0, 3).map((match) => (
                <Link
                  key={match.id}
                  to={`/app/chat/${match.id}`}
                  className="block rounded border border-neutral-border px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <p className="font-medium text-slate-800">{match.otherUser.name}</p>
                  <p className="text-xs text-slate-500">
                    {match.compatibility}% compatibility - {match.lastMessage || 'No messages yet'}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">No matches yet. Use discovery to start your first conversation pipeline.</p>
          )}
        </section>

        <section className="rounded-lg border border-neutral-border bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Next best action</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{nextAction.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{nextAction.description}</p>

          <Link
            to={nextAction.to}
            className="mt-4 inline-block rounded bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
          >
            {nextAction.cta}
          </Link>

          {preferences ? (
            <>
              <p className="mt-5 text-xs font-bold uppercase tracking-widest text-slate-500">Preference signals</p>
              <p className="mt-2 text-sm text-slate-700">
                Budget: {preferences.minBudget} - {preferences.maxBudget}
              </p>
              <p className="text-sm text-slate-700">City: {preferences.city}</p>
              <p className="text-sm text-slate-700">
                Gender preference: {preferences.genderPreference}
              </p>

              <div className="mt-4 space-y-2">
                {weightSummary.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded border border-neutral-border px-3 py-2 text-sm"
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-primary">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-5 text-sm text-slate-600">
              Preferences are not set yet. Complete onboarding to initialize matching.
            </p>
          )}
        </section>
      </div>
    </section>
  )
}
