import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical,
  Image,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  MapPin,
  Clock
} from 'lucide-react'

import { Button, Card } from '@/components/ui'
import { apiRequest } from '@/services/api'
import { socket } from './socket'

const spring = { type: 'spring', stiffness: 300, damping: 30 }

// Conversation List Item
function ConversationItem({ conversation, isActive, onClick }) {
  const hasUnread = conversation.unreadCount > 0
  const userImage = conversation.user?.photos?.[0] || conversation.user?.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'

  return (
    <motion.button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 hover:bg-surface-50 transition-colors ${
        isActive ? 'bg-primary-50 border-l-4 border-primary-500' : ''
      }`}
      whileHover={{ x: 4 }}
      transition={spring}
    >
      <div className="relative">
        <img 
          src={userImage} 
          alt={conversation.user?.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {conversation.online && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold truncate ${hasUnread ? 'text-surface-900' : 'text-surface-700'}`}>
            {conversation.user?.name || 'Roommate'}
          </h3>
          <span className="text-xs text-surface-400">{conversation.lastMessageTime || ''}</span>
        </div>
        <p className={`text-sm truncate ${hasUnread ? 'text-surface-700 font-medium' : 'text-surface-500'}`}>
          {conversation.lastMessage || 'Start a conversation'}
        </p>
      </div>
      {hasUnread && (
        <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-medium">{conversation.unreadCount}</span>
        </div>
      )}
    </motion.button>
  )
}

// Message Bubble
function MessageBubble({ message, isOwn, showAvatar }) {
  return (
    <motion.div
      className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring}
    >
      {!isOwn && showAvatar && (
        <img 
          src={message.senderImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'}
          alt=""
          className="w-8 h-8 rounded-full object-cover shrink-0 mt-auto"
        />
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}
      
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-2.5 rounded-2xl ${
            isOwn 
              ? 'bg-primary-500 text-white rounded-br-md' 
              : 'bg-surface-100 text-surface-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
          <span className="text-xs text-surface-400">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && (
            message.read 
              ? <CheckCheck className="w-3.5 h-3.5 text-primary-500" />
              : <Check className="w-3.5 h-3.5 text-surface-400" />
          )}
        </div>
      </div>
    </motion.div>
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
        // First load all matches to show in sidebar
        const matches = await apiRequest('/matches/me', {}, getAccessTokenSilently)
        if (isMounted && matches) {
          const convos = matches.map(m => ({
            id: m.id,
            user: m.otherUser ? {
              ...m.otherUser,
              image: m.otherUser.photos?.[0]
            } : { name: 'Roommate', image: null },
            lastMessage: m.lastMessage || '',
            lastMessageTime: m.matchedAt ? new Date(m.matchedAt).toLocaleDateString() : '',
            unreadCount: 0,
            online: false
          }))
          setConversations(convos)
          
          // If no active convo but we have matches, select first one
          if (!activeConvo && convos.length > 0) {
            setActiveConvo(convos[0].id)
          }
        }

        // Load chat for active match
        if (activeConvo) {
          const data = await apiRequest(`/chat/${activeConvo}`, {}, getAccessTokenSilently)
          
          if (isMounted) {
            setConversationId(data.conversation?.id)
            setMessages(data.messages || [])
            setOtherUser(data.otherUser)
            
            // Socket setup
            if (data.conversation?.id) {
              socket.emit('join', data.conversation.id)
            }
          }
        }
        
        if (isMounted) setIsLoading(false)
      } catch (error) {
        console.error('Failed to load chat:', error)
        if (isMounted) setIsLoading(false)
      }
    }
    init()

    // Socket listeners
    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      isMounted = false
      socket.off('new_message')
    }
  }, [activeConvo, getAccessTokenSilently])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return

    const messageContent = input.trim()
    const tempId = `temp-${Date.now()}`
    
    // Optimistic update
    const newMessage = {
      id: tempId,
      senderId: user?.sub,
      content: messageContent,
      createdAt: new Date().toISOString(),
      read: false
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')

    // Send via socket
    socket.emit('send_message', {
      conversationId,
      senderId: user?.sub,
      content: messageContent,
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeConversation = conversations.find(c => c.id === activeConvo) || conversations[0]
  // Use otherUser from direct API call if available, fallback to conversation user
  const chatUser = otherUser || activeConversation?.user

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-80px)] flex bg-surface-50">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-surface-200 flex-col hidden md:flex">
        <div className="p-4 border-b border-surface-100">
          <h2 className="text-xl font-bold text-surface-900">Messages</h2>
          <p className="text-sm text-surface-500">{conversations.length} conversations</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => (
            <ConversationItem
              key={convo.id}
              conversation={convo}
              isActive={convo.id === activeConvo}
              onClick={() => setActiveConvo(convo.id)}
            />
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/app/matches" className="md:hidden p-2 -ml-2 hover:bg-surface-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-surface-600" />
            </Link>
            <div className="relative">
              <img 
                src={chatUser?.photos?.[0] || chatUser?.image || chatUser?.picture || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              {activeConversation?.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">{chatUser?.name || 'Roommate'}</h3>
              <span className="text-xs text-success-600">{activeConversation?.online ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
              <Phone className="w-5 h-5 text-surface-600" />
            </button>
            <button className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
              <Video className="w-5 h-5 text-surface-600" />
            </button>
            <button className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
              <MoreVertical className="w-5 h-5 text-surface-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => {
            const isOwn = msg.senderId === user?.sub
            const showAvatar = !isOwn && (i === 0 || messages[i - 1]?.senderId === user?.sub)
            
            return (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-surface-200 p-4">
          <div className="flex items-end gap-3">
            <div className="flex gap-1">
              <button className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
                <Paperclip className="w-5 h-5 text-surface-500" />
              </button>
              <button className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
                <Image className="w-5 h-5 text-surface-500" />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-2.5 bg-surface-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm placeholder:text-surface-400"
                style={{ minHeight: '42px', maxHeight: '120px' }}
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-surface-200 rounded-xl transition-colors">
                <Smile className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            <motion.button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 bg-primary-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

