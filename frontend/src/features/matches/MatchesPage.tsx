import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toApiErrorMessage } from '@/services/api'
import { getMyMatches } from '@/services/matches.transport'
import type { Match } from '@/types'

export function MatchesPage() {
  const navigate = useNavigate()
  const [reloadToken, setReloadToken] = useState(0)
  const [matches, setMatches] = useState<Match[]>([])
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
        const result = await getMyMatches()
        if (!cancelled) {
          setMatches(result)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(toApiErrorMessage(loadError, 'Failed to load matches'))
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

  if (loading) {
    return <p className="text-sm text-slate-500">Loading matches...</p>
  }

  return (
    <section className="rounded-lg border border-neutral-border bg-surface p-5">
      <div className="mb-4 border-b border-neutral-border pb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Matches</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Mutual connections</h2>
        <button
          type="button"
          onClick={retryLoad}
          className="mt-3 rounded border border-neutral-border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mb-4 space-y-2 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
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

      {matches.length === 0 ? (
        <p className="text-sm text-slate-600">No matches yet. Head to discovery to start connecting.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-border text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-2 py-2">Candidate</th>
                <th className="px-2 py-2">Compatibility</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Last Message</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr
                  key={match.id}
                  className="cursor-pointer border-b border-neutral-border hover:bg-slate-50"
                  onClick={() => navigate(`/app/chat/${match.id}`)}
                >
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      {match.otherUser.photos[0] ? (
                        <img
                          src={match.otherUser.photos[0]}
                          alt={match.otherUser.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-xs text-slate-500">
                          N/A
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">{match.otherUser.name}</p>
                        <p className="text-xs text-slate-500">{match.otherUser.city || 'City not shared'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 font-mono font-semibold text-primary">{match.compatibility}%</td>
                  <td className="px-2 py-3">Matched</td>
                  <td className="px-2 py-3 text-slate-600">
                    {match.lastMessage || 'No messages yet'}
                  </td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        navigate(`/app/chat/${match.id}`)
                      }}
                      className="rounded-md border border-neutral-border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Open Chat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
