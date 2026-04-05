import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { mergeIncomingMessage } from '@/features/chat/chat.messages'
import { getChatSocket } from '@/features/chat/chat.socket'
import { toApiErrorMessage } from '@/services/api'
import { openChat } from '@/services/chat.transport'
import { getMyMatches } from '@/services/matches.transport'
import type { ChatMessage, Match, OpenChatResponse } from '@/types'

function toDisplayTime(value: string | undefined): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) {
    return ''
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ChatPage() {
  const navigate = useNavigate()
  const params = useParams<{ matchId?: string }>()
  const currentUserId = useAppSelector((state) => state.auth.user?.id || null)

  const [matchesReloadToken, setMatchesReloadToken] = useState(0)
  const [chatReloadToken, setChatReloadToken] = useState(0)
  const [matches, setMatches] = useState<Match[]>([])
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null)
  const [chatData, setChatData] = useState<OpenChatResponse | null>(null)
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)
  const [matchesError, setMatchesError] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'reconnecting' | 'disconnected'
  >('connecting')
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadMatches(): Promise<void> {
      setLoadingMatches(true)
      setMatchesError(null)

      try {
        const nextMatches = await getMyMatches()
        if (cancelled) {
          return
        }

        setMatches(nextMatches)

        if (params.matchId && nextMatches.some((entry) => entry.id === params.matchId)) {
          setActiveMatchId(params.matchId)
        } else {
          const firstMatchId = nextMatches[0]?.id || null
          setActiveMatchId(firstMatchId)
          if (!params.matchId && firstMatchId) {
            navigate(`/app/chat/${firstMatchId}`, { replace: true })
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setMatches([])
          setActiveMatchId(null)
          setMatchesError(toApiErrorMessage(loadError, 'Failed to load chats'))
        }
      } finally {
        if (!cancelled) {
          setLoadingMatches(false)
        }
      }
    }

    loadMatches()

    return () => {
      cancelled = true
    }
  }, [navigate, params.matchId, matchesReloadToken])

  useEffect(() => {
    if (!activeMatchId) {
      setChatData(null)
      setChatError(null)
      return
    }

    const matchId = activeMatchId

    let cancelled = false

    async function loadConversation(): Promise<void> {
      setLoadingChat(true)
      setChatError(null)

      try {
        const response = await openChat(matchId)
        if (!cancelled) {
          setChatData(response)
        }
      } catch (loadError) {
        if (!cancelled) {
          setChatData(null)
          setChatError(toApiErrorMessage(loadError, 'Failed to open chat'))
        }
      } finally {
        if (!cancelled) {
          setLoadingChat(false)
        }
      }
    }

    loadConversation()

    return () => {
      cancelled = true
    }
  }, [activeMatchId, chatReloadToken])

  useEffect(() => {
    if (!chatData?.conversation?.id) {
      return
    }

    const socket = getChatSocket()
    const conversationId = chatData.conversation.id

    const onConnect = () => {
      setConnectionStatus('connected')
      socket.emit('joinRoom', conversationId)
    }

    const onReconnectAttempt = () => {
      setConnectionStatus('reconnecting')
    }

    const onDisconnect = () => {
      setConnectionStatus('disconnected')
    }

    const onConnectError = () => {
      setConnectionStatus('disconnected')
    }

    const onMessage = (payload: ChatMessage) => {
      setChatData((prev) => mergeIncomingMessage(prev, conversationId, payload))
    }

    setConnectionStatus(socket.connected ? 'connected' : 'connecting')
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)
    socket.io.on('reconnect_attempt', onReconnectAttempt)

    if (socket.connected) {
      socket.emit('joinRoom', conversationId)
    }

    socket.on('message', onMessage)
    socket.on('new_message', onMessage)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
      socket.io.off('reconnect_attempt', onReconnectAttempt)
      socket.off('message', onMessage)
      socket.off('new_message', onMessage)
    }
  }, [chatData?.conversation?.id])

  const activeMatch = useMemo(
    () => matches.find((match) => match.id === activeMatchId) || null,
    [matches, activeMatchId],
  )

  async function sendCurrentMessage(): Promise<void> {
    const content = draft.trim()
    if (!content || !chatData?.conversation?.id || !currentUserId) {
      return
    }

    const socket = getChatSocket()
    if (!socket.connected) {
      setConnectionStatus('disconnected')
      return
    }

    setSending(true)

    try {
      socket.emit('sendMessage', {
        conversationId: chatData.conversation.id,
        senderId: currentUserId,
        content,
      })

      setDraft('')
    } finally {
      setSending(false)
    }
  }

  if (loadingMatches) {
    return <p className="text-sm text-slate-500">Loading chat threads...</p>
  }

  function retryMatchesLoad(): void {
    setMatchesReloadToken((value) => value + 1)
  }

  function retryChatLoad(): void {
    setChatReloadToken((value) => value + 1)
  }

  const statusClassName =
    connectionStatus === 'connected'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : connectionStatus === 'reconnecting'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-rose-50 text-rose-700 border-rose-200'

  const statusLabel =
    connectionStatus === 'connected'
      ? 'Realtime connected'
      : connectionStatus === 'reconnecting'
        ? 'Reconnecting'
        : connectionStatus === 'connecting'
          ? 'Connecting'
          : 'Disconnected'

  return (
    <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
      <aside className="rounded-lg border border-neutral-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Threads</p>
          <button
            type="button"
            onClick={retryMatchesLoad}
            className="rounded border border-neutral-border px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {matchesError ? (
          <div className="mb-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            <p>{matchesError}</p>
            <button
              type="button"
              onClick={retryMatchesLoad}
              className="mt-2 rounded border border-rose-300 px-2 py-1 font-semibold"
            >
              Retry
            </button>
          </div>
        ) : null}

        {matches.length === 0 ? (
          <p className="text-sm text-slate-600">No conversations yet.</p>
        ) : (
          <div className="space-y-2">
            {matches.map((match) => (
              <button
                key={match.id}
                type="button"
                onClick={() => {
                  setActiveMatchId(match.id)
                  navigate(`/app/chat/${match.id}`)
                }}
                className={[
                  'w-full rounded-md border px-3 py-2 text-left',
                  activeMatchId === match.id
                    ? 'border-primary bg-mint'
                    : 'border-neutral-border hover:bg-slate-50',
                ].join(' ')}
              >
                <p className="text-sm font-semibold text-slate-900">{match.otherUser.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {match.lastMessage || 'No messages yet'}
                </p>
              </button>
            ))}
          </div>
        )}
      </aside>

      <div className="rounded-lg border border-neutral-border bg-surface p-4">
        <div className="mb-3 border-b border-neutral-border pb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Conversation</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              {activeMatch?.otherUser.name || 'Select a conversation'}
            </h2>
            <span className={[`rounded border px-2 py-1 text-xs font-medium`, statusClassName].join(' ')}>
              {statusLabel}
            </span>
          </div>
        </div>

        {chatError ? (
          <div className="mb-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <p>{chatError}</p>
            <button
              type="button"
              onClick={retryChatLoad}
              className="mt-2 rounded border border-rose-300 px-2 py-1 text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : null}

        {loadingChat ? (
          <p className="text-sm text-slate-500">Loading messages...</p>
        ) : !chatData ? (
          <p className="text-sm text-slate-600">Choose a match to start chatting.</p>
        ) : (
          <>
            <div className="h-[420px] space-y-2 overflow-y-auto rounded border border-neutral-border bg-canvas p-3">
              {chatData.messages.length === 0 ? (
                <p className="text-sm text-slate-500">No messages yet.</p>
              ) : (
                chatData.messages.map((message) => {
                  const isMine = message.senderId === currentUserId

                  return (
                    <div
                      key={message.id}
                      className={[
                        'max-w-[80%] rounded-md px-3 py-2 text-sm',
                        isMine
                          ? 'ml-auto bg-primary text-white'
                          : 'bg-white text-slate-800 border border-neutral-border',
                      ].join(' ')}
                    >
                      <p>{message.content}</p>
                      <p className={['mt-1 text-[10px]', isMine ? 'text-emerald-100' : 'text-slate-500'].join(' ')}>
                        {toDisplayTime(message.createdAt || message.timestamp)}
                      </p>
                    </div>
                  )
                })
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write a message"
                className="w-full rounded-md border border-neutral-border px-3 py-2 text-sm"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void sendCurrentMessage()
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  void sendCurrentMessage()
                }}
                disabled={sending || !draft.trim() || connectionStatus !== 'connected'}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>

      <aside className="rounded-lg border border-neutral-border bg-surface p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Match Intel</p>

        {activeMatch ? (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded border border-neutral-border bg-canvas px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Compatibility</p>
              <p className="font-mono font-semibold text-primary">{activeMatch.compatibility}%</p>
            </div>

            <div className="rounded border border-neutral-border bg-canvas px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Budget</p>
              <p>
                {activeMatch.otherUser.budgetMin} - {activeMatch.otherUser.budgetMax}
              </p>
            </div>

            <div className="rounded border border-neutral-border bg-canvas px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">City</p>
              <p>{activeMatch.otherUser.city || 'Not shared'}</p>
            </div>

            {activeMatch.otherUser.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeMatch.otherUser.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-border bg-canvas px-2 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-600">Select a thread to view details.</p>
        )}
      </aside>
    </section>
  )
}
