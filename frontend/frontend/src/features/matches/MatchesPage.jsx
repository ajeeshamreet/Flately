import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth0 } from '@auth0/auth0-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  MapPin, 
  DollarSign,
  Sparkles,
  Heart,
  Search,
  Star,
  Clock
} from 'lucide-react'

import { Button, Card, CardContent } from '@/components/ui'
import { apiRequest } from '@/services/api'
import { start, setMatches } from './matchesSlice'

const spring = { type: 'spring', stiffness: 300, damping: 30 }

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: spring }
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

// Calculate if match is new (within 24 hours)
const DAY_MS = 24 * 60 * 60 * 1000

function MatchCard({ match, now }) {
  const isNew = new Date(match.createdAt) > new Date(now - DAY_MS)

  return (
    <Card className="overflow-hidden group">
      <div className="relative">
        <img 
          src={match.otherUser?.photos?.[0] || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face`}
          alt={match.otherUser?.name || 'Match'}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-sm font-semibold text-primary-600">{match.compatibility || 85}%</span>
          </div>
        </div>

        {isNew && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-success-500 rounded-full shadow-sm">
            <span className="text-xs font-semibold text-white">NEW</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-black/50 to-transparent" />
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-surface-900">
              {match.otherUser?.name || 'User'}, {match.otherUser?.age || 26}
            </h3>
            <div className="flex items-center gap-1.5 text-surface-500 text-sm mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{match.otherUser?.city || 'New York, NY'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-surface-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(match.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-surface-600 mb-3">
          <DollarSign className="w-4 h-4 text-success-500" />
          <span>${match.otherUser?.budgetMin || 800} - ${match.otherUser?.budgetMax || 1200}/mo</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(match.otherUser?.tags || ['Roommate']).slice(0, 3).map(tag => (
            <span 
              key={tag}
              className="px-2 py-0.5 bg-surface-100 text-surface-600 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Link to={`/app/chat/${match.id}`} className="flex-1">
            <Button className="w-full gap-2" size="sm">
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="px-3">
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MatchesPage() {
  const dispatch = useDispatch()
  const { getAccessTokenSilently } = useAuth0()
  const matches = useSelector(state => state.matches.list)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [now] = useState(() => Date.now()) // Capture time once on mount

  useEffect(() => {
    let isMounted = true
    
    async function load() {
      try {
        dispatch(start())
        const data = await apiRequest('/matches/me', {}, getAccessTokenSilently)
        
        if (isMounted) {
          dispatch(setMatches(data || []))
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to load matches:', error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    
    load()
    return () => { isMounted = false }
  }, [dispatch, getAccessTokenSilently])

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      if (searchQuery) {
        const name = match.otherUser?.name?.toLowerCase() || ''
        const location = match.otherUser?.city?.toLowerCase() || ''
        const query = searchQuery.toLowerCase()
        if (!name.includes(query) && !location.includes(query)) return false
      }
      
      if (filter === 'new') {
        const isNew = new Date(match.createdAt) > new Date(now - DAY_MS)
        if (!isNew) return false
      }
      
      return true
    })
  }, [matches, searchQuery, filter, now])

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Your Matches</h1>
            <p className="text-surface-600 mt-1">
              {matches.length} people want to be your roommate!
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all w-48"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 cursor-pointer"
            >
              <option value="all">All Matches</option>
              <option value="new">New Today</option>
            </select>
          </div>
        </div>
      </motion.div>

      {!filteredMatches.length && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-surface-100 rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-surface-400" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">
            {searchQuery ? 'No matches found' : 'No matches yet'}
          </h2>
          <p className="text-surface-600 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? 'Try a different search term or filter.' 
              : 'Start swiping on the Discover page to find your perfect roommate!'}
          </p>
          {!searchQuery && (
            <Link to="/app/discover">
              <Button>Start Discovering</Button>
            </Link>
          )}
        </motion.div>
      )}

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {filteredMatches.map((match) => (
            <motion.div
              key={match.id}
              variants={fadeUp}
              layout
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <MatchCard match={match} now={now} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
