// @ts-nocheck
import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import {
  fetchMyMatches,
  joinChatRoom,
  onChatMessage,
  openConversation,
  sendChatMessage,
} from './chat.transport'

function ChatThread({ conversation, isActive, onClick }) {
  const userImage = conversation.user?.photos?.[0] || conversation.user?.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'
  const hasUnread = conversation.unreadCount > 0

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-3 p-3 px-4 cursor-pointer border-b border-slate-200 transition-colors ${
        isActive ? 'bg-mint border-l-[3px] border-l-[#166534]' : 'hover:bg-slate-50'
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-lg bg-cover bg-center border border-slate-200" style={{ backgroundImage: `url('${userImage}')` }} />
        {conversation.online && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className={`text-sm truncate ${isActive ? 'font-bold text-slate-900' : hasUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
            {conversation.user?.name || 'Roommate'}
          </h3>
          <span className={`text-[10px] font-mono ${hasUnread ? 'text-[#166534] font-bold' : 'text-slate-400'}`}>{conversation.lastMessageTime || ''}</span>
        </div>
        <p className={`text-xs truncate ${hasUnread ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>{conversation.lastMessage || 'Start a conversation'}</p>
      </div>
      {hasUnread && <div className="absolute right-3 top-1/2 mt-3 w-2 h-2 bg-[#166534] rounded-full" />}
    </div>
  )
}

function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex flex-col gap-1 max-w-[80%] ${isOwn ? 'items-end self-end' : 'items-start'}`}>
      <div className={`p-4 rounded-lg text-sm leading-relaxed font-medium ${
        isOwn
          ? 'bg-[#166534] border border-[#166534] text-white rounded-tr-sm'
          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm'
      }`}>
        {message.content}
      </div>
      <span className={`text-[10px] text-slate-400 font-mono ${isOwn ? 'mr-1' : 'ml-1'}`}>
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}

export default function ChatPage() {
  const { matchId } = useParams()
  const { user, getAccessTokenSilently } = useAuth0()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConvo, setActiveConvo] = useState(matchId || null)
  const [isLoading, setIsLoading] = useState(true)
  const [otherUser, setOtherUser] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      try {
        const matches = await fetchMyMatches(getAccessTokenSilently)
        if (isMounted && matches) {
          const convos = matches.map(m => ({
            id: m.id, user: m.otherUser ? { ...m.otherUser, image: m.otherUser.photos?.[0] } : { name: 'Roommate', image: null },
            lastMessage: m.lastMessage || '', lastMessageTime: m.matchedAt ? new Date(m.matchedAt).toLocaleDateString() : '', unreadCount: 0, online: false
          }))
          setConversations(convos)
          if (!activeConvo && convos.length > 0) setActiveConvo(convos[0].id)
        }
        if (activeConvo) {
          const data = await openConversation(activeConvo, getAccessTokenSilently)
          if (isMounted) {
            setConversationId(data.conversation?.id); setMessages(data.messages || []); setOtherUser(data.otherUser)
            if (data.conversation?.id) joinChatRoom(data.conversation.id)
          }
        }
        if (isMounted) setIsLoading(false)
      } catch (error) { console.error('Failed to load chat:', error); if (isMounted) setIsLoading(false) }
    }
    init()
    const unsubscribe = onChatMessage((msg) => setMessages((prev) => [...prev, msg]))
    return () => { isMounted = false; unsubscribe() }
  }, [activeConvo, getAccessTokenSilently])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return
    const messageContent = input.trim()
    setMessages(prev => [...prev, { id: `temp-${Date.now()}`, senderId: user?.sub, content: messageContent, createdAt: new Date().toISOString() }])
    setInput('')
    sendChatMessage({ conversationId, senderId: user?.sub, content: messageContent })
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }
  const activeConversation = conversations.find(c => c.id === activeConvo) || conversations[0]
  const chatUser = otherUser || activeConversation?.user

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-3 border-slate-200 border-t-[#166534] rounded-full animate-spin" /></div>

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Left — Threads */}
      <aside className="w-80 border-r border-slate-200 flex flex-col bg-white shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative mb-3">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-1 focus:ring-[#166534] focus:border-[#166534] placeholder:text-slate-400 font-medium" placeholder="Search threads..." type="text" />
          </div>
          <div className="flex gap-4">
            <button className="text-xs font-bold text-slate-900 border-b-2 border-[#166534] pb-1">All</button>
            <button className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors pb-1">Unread (2)</button>
            <button className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors pb-1">Archived</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => (
            <ChatThread key={convo.id} conversation={convo} isActive={convo.id === activeConvo} onClick={() => setActiveConvo(convo.id)} />
          ))}
        </div>
      </aside>

      {/* Center — Messages */}
      <section className="flex-1 flex flex-col min-w-0 bg-mint relative">
        <header className="h-14 flex items-center justify-between px-6 border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {chatUser?.name || 'Roommate'} <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </h2>
              <span className="text-xs text-slate-500 font-mono">Last active: Just now</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#166534] hover:border-[#166534] transition-colors">
              <span className="material-symbols-outlined text-[18px]">videocam</span>
            </button>
            <button className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#166534] hover:border-[#166534] transition-colors">
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <div className="flex justify-center my-4">
            <span className="bg-white/50 border border-slate-200/60 text-slate-500 text-[10px] font-mono font-medium px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
          </div>
          {messages.map((msg) => <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.sub} />)}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-6 bg-white border-t border-slate-200">
          <div className="flex gap-3 items-end">
            <button className="p-2.5 text-slate-400 hover:text-[#166534] transition-colors rounded-lg border border-transparent hover:bg-mint hover:border-slate-200 self-center">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <div className="flex-1 relative">
              <textarea
                value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-[#166534] focus:border-[#166534] resize-none h-[48px] min-h-[48px] max-h-[120px] shadow-sm" placeholder="Type a message..." rows="1"
              />
            </div>
            <button
              onClick={handleSend} disabled={!input.trim()}
              className="bg-[#166534] hover:bg-[#14532d] text-white rounded-lg px-6 h-[48px] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-center"
            >
              <span className="text-sm font-bold tracking-wide">Send</span>
            </button>
          </div>
        </div>
      </section>

      {/* Right — Match Intel */}
      <aside className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto hidden xl:flex">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-slate-400">grid_view</span> Match Intel
          </h3>
          <span className="material-symbols-outlined text-slate-400 text-[18px] cursor-pointer hover:text-[#166534]">info</span>
        </div>
        <div className="p-5 flex flex-col gap-6">
          <div className="bg-mint rounded-lg p-4 border border-[#166534]/20 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Match Score</p>
              <p className="text-3xl font-bold font-mono text-[#166534] mt-1 tracking-tight">94%</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-white border border-[#166534]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#166534] text-[24px]">verified</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ icon: 'payments', label: 'Budget', val: '$1.5k' }, { icon: 'calendar_month', label: 'Move-in', val: 'Oct 1st' },
              { icon: 'cake', label: 'Age', val: '27' }, { icon: 'work', label: 'Job', val: 'Design' }].map(s => (
              <div key={s.label} className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">{s.icon}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{s.label}</span>
                </div>
                <p className="font-mono text-sm font-bold text-slate-900">{s.val}</p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Lifestyle &amp; Habits</h4>
            <div className="flex flex-wrap gap-2">
              {['Early Bird', 'Non-Smoker', 'Vegetarian', 'Social Drinker', 'Clean Freak'].map(t => (
                <span key={t} className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Private Notes</h4>
            <textarea className="w-full text-xs bg-yellow-50 border border-yellow-200 text-slate-700 rounded-lg p-3 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-yellow-700/50 font-medium" placeholder="Add private notes..." />
          </div>
          <div className="pt-2 mt-auto grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors uppercase tracking-wide">
              <span className="material-symbols-outlined text-[16px]">flag</span> Report
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-red-200 hover:bg-red-50 text-xs font-bold text-red-600 transition-colors uppercase tracking-wide">
              <span className="material-symbols-outlined text-[16px]">block</span> Unmatch
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
