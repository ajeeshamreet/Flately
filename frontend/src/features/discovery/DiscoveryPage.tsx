import { useEffect, useMemo, useState } from 'react'
import { toApiErrorMessage } from '@/services/api'
import { getDiscoveryFeed, swipeDiscoveryUser } from '@/services/discovery.transport'
import type { DiscoveryProfile } from '@/types'

function getCandidateImage(candidate: DiscoveryProfile): string | null {
  return candidate.photos.length > 0 ? candidate.photos[0] : null
}

export function DiscoveryPage() {
  const [reloadToken, setReloadToken] = useState(0)
  const [feed, setFeed] = useState<DiscoveryProfile[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function retryLoad(): void {
    setReloadToken((value) => value + 1)
  }

  useEffect(() => {
    let cancelled = false

    async function load(): Promise<void> {
      setLoading(true)
      setError(null)

      try {
        const result = await getDiscoveryFeed()
        if (cancelled) {
          return
        }

        setFeed(result)
        setSelectedUserId(result[0]?.id || null)
      } catch (loadError) {
        if (!cancelled) {
          setError(toApiErrorMessage(loadError, 'Failed to load discovery feed'))
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

  const selectedCandidate = useMemo(
    () => feed.find((candidate) => candidate.id === selectedUserId) || null,
    [feed, selectedUserId],
  )

  function removeCandidate(userId: string): void {
    setFeed((prev) => {
      const next = prev.filter((entry) => entry.id !== userId)
      setSelectedUserId((current) => {
        if (current !== userId) {
          return current
        }
        return next[0]?.id || null
      })
      return next
    })
  }

  async function passCandidate(): Promise<void> {
    if (!selectedCandidate) {
      return
    }

    setActionLoading(true)
    setError(null)
    setNotice(null)

    try {
      await swipeDiscoveryUser({
        toUserId: selectedCandidate.id,
        action: 'dislike',
      })
      removeCandidate(selectedCandidate.id)
      setNotice('Candidate skipped.')
    } catch (actionError) {
      setError(toApiErrorMessage(actionError, 'Unable to skip candidate'))
    } finally {
      setActionLoading(false)
    }
  }

  async function connectCandidate(): Promise<void> {
    if (!selectedCandidate) {
      return
    }

    setActionLoading(true)
    setError(null)
    setNotice(null)

    try {
      const response = await swipeDiscoveryUser({
        toUserId: selectedCandidate.id,
        action: 'like',
      })
      removeCandidate(selectedCandidate.id)
      setNotice(response.matched ? `It is a match with ${selectedCandidate.name}.` : `Liked ${selectedCandidate.name}.`)
    } catch (actionError) {
      setError(toApiErrorMessage(actionError, 'Unable to connect with candidate'))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading discovery feed...</p>
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-neutral-border bg-surface p-4">
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-neutral-border pb-3">
          <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Discovery Queue</p>
          <p className="mt-1 text-sm text-slate-600">{feed.length} candidates remaining</p>
          </div>
          <button
            type="button"
            onClick={retryLoad}
            className="rounded border border-neutral-border px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {feed.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">No candidates right now. Check back soon.</p>
            <button
              type="button"
              onClick={retryLoad}
              className="rounded-md border border-neutral-border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Retry feed
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {feed.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setSelectedUserId(candidate.id)}
                className={[
                  'w-full rounded-md border px-3 py-2 text-left',
                  selectedUserId === candidate.id
                    ? 'border-primary bg-mint'
                    : 'border-neutral-border hover:bg-slate-50',
                ].join(' ')}
              >
                <p className="text-sm font-semibold text-slate-900">{candidate.name}</p>
                <p className="text-xs text-slate-500">
                  {candidate.age ? `${candidate.age} yrs` : 'Age not shared'} - {candidate.city || 'City not shared'}
                </p>
                <p className="mt-1 text-xs font-medium text-primary">
                  Compatibility: {candidate.compatibility}%
                </p>
              </button>
            ))}
          </div>
        )}
      </aside>

      <div className="rounded-lg border border-neutral-border bg-surface p-5">
        <div className="mb-4 border-b border-neutral-border pb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Candidate Detail</p>
        </div>

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
        {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}

        {!selectedCandidate ? (
          <p className="text-sm text-slate-600">Select a candidate from the queue.</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-neutral-border">
              {getCandidateImage(selectedCandidate) ? (
                <img
                  src={getCandidateImage(selectedCandidate) || ''}
                  alt={selectedCandidate.name}
                  className="h-72 w-full object-cover"
                />
              ) : (
                <div className="flex h-72 items-center justify-center bg-canvas text-sm text-slate-500">
                  No photo provided
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedCandidate.name}</h2>
              <p className="text-sm text-slate-600">
                {selectedCandidate.age ? `${selectedCandidate.age} years old` : 'Age not shared'} -{' '}
                {selectedCandidate.occupation || 'Occupation not shared'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded border border-neutral-border bg-canvas px-3 py-2 text-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">City</p>
                <p className="font-medium text-slate-800">{selectedCandidate.city || 'Not shared'}</p>
              </div>
              <div className="rounded border border-neutral-border bg-canvas px-3 py-2 text-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Housing</p>
                <p className="font-medium text-slate-800">
                  {selectedCandidate.hasRoom ? 'Has room' : 'Seeking room'}
                </p>
              </div>
              <div className="rounded border border-neutral-border bg-canvas px-3 py-2 text-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Compatibility</p>
                <p className="font-mono font-semibold text-primary">{selectedCandidate.compatibility}%</p>
              </div>
            </div>

            <div className="rounded border border-neutral-border bg-canvas px-3 py-2 text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Budget Range</p>
              <p className="font-medium text-slate-800">
                {selectedCandidate.budgetMin} - {selectedCandidate.budgetMax}
              </p>
            </div>

            {selectedCandidate.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-border bg-canvas px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={passCandidate}
                disabled={actionLoading}
                className="rounded-md border border-neutral-border px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
              >
                Pass
              </button>
              <button
                type="button"
                onClick={connectCandidate}
                disabled={actionLoading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Connect
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
