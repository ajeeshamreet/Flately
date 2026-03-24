import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth0 } from '@auth0/auth0-react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { 
  X, 
  Heart, 
  Star,
  MapPin, 
  DollarSign,
  Sparkles,
  RotateCcw,
  Filter
} from 'lucide-react'

import { Button } from '@/components/ui'
import { apiRequest } from '@/services/api'
import { start, setFeed, removeUser } from './discoverySlice'

const spring = { type: 'spring', stiffness: 300, damping: 30 }

// Swipeable Card Component
function SwipeCard({ profile, onSwipe, isTop }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30])
  const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0.5, 1, 1, 1, 0.5])
  
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])
  
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const photos = profile.photos?.length > 0 ? profile.photos : [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face'
  ]

  const handleDragEnd = useCallback((_, info) => {
    if (info.offset.x > 100) {
      onSwipe('like')
    } else if (info.offset.x < -100) {
      onSwipe('skip')
    }
  }, [onSwipe])

  const nextPhoto = () => setCurrentPhoto(p => (p + 1) % photos.length)
  const prevPhoto = () => setCurrentPhoto(p => (p - 1 + photos.length) % photos.length)

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0 rounded-3xl bg-white shadow-xl overflow-hidden"
        initial={{ scale: 0.95, opacity: 0.5 }}
        animate={{ scale: 0.95, opacity: 0.7 }}
      />
    )
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative h-[65%]">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentPhoto}
              src={photos[currentPhoto]}
              alt={profile.name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>

          <div className="absolute inset-0 flex">
            <button className="w-1/2 h-full" onClick={prevPhoto} />
            <button className="w-1/2 h-full" onClick={nextPhoto} />
          </div>

          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 px-4">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === currentPhoto ? 'bg-white w-8' : 'bg-white/50 w-4'
                }`}
              />
            ))}
          </div>

          <motion.div 
            className="absolute inset-0 bg-success-500/30 flex items-center justify-center"
            style={{ opacity: likeOpacity }}
          >
            <div className="px-6 py-3 border-4 border-success-500 rounded-xl -rotate-20">
              <span className="text-4xl font-bold text-success-500">LIKE</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="absolute inset-0 bg-error-500/30 flex items-center justify-center"
            style={{ opacity: nopeOpacity }}
          >
            <div className="px-6 py-3 border-4 border-error-500 rounded-xl rotate-20">
              <span className="text-4xl font-bold text-error-500">NOPE</span>
            </div>
          </motion.div>

          <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="font-bold text-primary-600">{profile.score || 85}% Match</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/60 to-transparent" />
        </div>

        <div className="p-5 h-[35%] overflow-y-auto">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-surface-900">
                {profile.name}, {profile.age || 28}
              </h2>
              <div className="flex items-center gap-1.5 text-surface-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.location || profile.city || 'New York, NY'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 text-surface-700">
            <DollarSign className="w-4 h-4 text-success-500" />
            <span className="font-medium">
              ${profile.budgetMin || 800} - ${profile.budgetMax || 1500}/mo
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {(profile.tags || ['Early Bird', 'Non-Smoker', 'Clean', 'Pet Lover']).map(tag => (
              <span 
                key={tag}
                className="px-3 py-1 bg-surface-100 text-surface-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {profile.bio && (
            <p className="text-surface-600 text-sm line-clamp-2">{profile.bio}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function DiscoveryPage() {
  const dispatch = useDispatch()
  const { getAccessTokenSilently } = useAuth0()
  const feed = useSelector((state) => state.discovery.feed)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load feed from backend
  useEffect(() => {
    let isMounted = true
    
    async function loadFeed() {
      try {
        dispatch(start())
        const data = await apiRequest('/discovery/feed', {}, getAccessTokenSilently)
        if (isMounted) {
          dispatch(setFeed(data || []))
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to load feed:', err)
        if (isMounted) {
          setError('Failed to load profiles. Please try again.')
          setIsLoading(false)
        }
      }
    }
    
    loadFeed()
    return () => { isMounted = false }
  }, [dispatch, getAccessTokenSilently])

  const handleSwipe = useCallback(async (userId, action) => {
    try {
      await apiRequest('/discovery/swipe', {
        method: 'POST',
        data: { toUserId: userId, action },
      }, getAccessTokenSilently)
      
      dispatch(removeUser(userId))
    } catch (err) {
      console.error('Swipe failed:', err)
    }
  }, [dispatch, getAccessTokenSilently])

  const currentProfile = feed[0]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-surface-600">Finding your matches...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <p className="text-error-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
      </div>
    )
  }

  if (!feed.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-surface-100 rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-surface-400" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">No More Profiles</h2>
          <p className="text-surface-600 mb-6">
            You've seen everyone in your area! Check back later or adjust your preferences.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Filter className="w-4 h-4 mr-2" />
              Adjust Filters
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Discover</h1>
          <p className="text-surface-600 text-sm">{feed.length} potential roommates</p>
        </div>
        <Button variant="ghost" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div className="relative aspect-3/4 max-h-[70vh]">
        <AnimatePresence>
          {feed.slice(0, 3).map((profile, i) => (
            <SwipeCard
              key={profile.userId || profile.id}
              profile={profile}
              isTop={i === 0}
              onSwipe={(action) => handleSwipe(profile.userId || profile.id, action)}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <motion.button
          className="w-14 h-14 rounded-full bg-white shadow-lg border border-surface-200 flex items-center justify-center text-error-500 hover:bg-error-50 hover:border-error-200 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => currentProfile && handleSwipe(currentProfile.userId || currentProfile.id, 'skip')}
        >
          <X className="w-7 h-7" />
        </motion.button>

        <motion.button
          className="w-16 h-16 rounded-full bg-primary-500 shadow-lg shadow-primary-500/30 flex items-center justify-center text-white hover:bg-primary-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => currentProfile && handleSwipe(currentProfile.userId || currentProfile.id, 'superlike')}
        >
          <Star className="w-8 h-8" />
        </motion.button>

        <motion.button
          className="w-14 h-14 rounded-full bg-white shadow-lg border border-surface-200 flex items-center justify-center text-success-500 hover:bg-success-50 hover:border-success-200 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => currentProfile && handleSwipe(currentProfile.userId || currentProfile.id, 'like')}
        >
          <Heart className="w-7 h-7" />
        </motion.button>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-sm text-surface-400">
        <span>← Skip</span>
        <span>↑ Super Like</span>
        <span>→ Like</span>
      </div>
    </div>
  )
}
