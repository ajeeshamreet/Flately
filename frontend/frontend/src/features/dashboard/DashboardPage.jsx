import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { motion } from 'framer-motion'
import { 
  Compass, 
  Heart, 
  MessageCircle, 
  User, 
  Bell,
  TrendingUp,
  MapPin,
  ChevronRight,
  Sparkles,
  Flame,
  Eye
} from 'lucide-react'

import { Button, Card, CardContent } from '@/components/ui'
import { apiRequest } from '@/services/api'

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

export default function DashboardPage() {
  const { user, getAccessTokenSilently } = useAuth0()
  const [stats, setStats] = useState({
    newMatches: 0,
    pendingChats: 0,
    profileViews: 0,
    matchRate: 0
  })
  const [recentMatches, setRecentMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    async function loadDashboard() {
      try {
        // Load matches from backend
        const matches = await apiRequest('/matches/me', {}, getAccessTokenSilently)
        
        if (isMounted) {
          const matchList = matches || []
          setRecentMatches(matchList.slice(0, 3).map(m => ({
            id: m.id,
            name: m.otherUser?.name || 'User',
            compatibility: m.compatibility || 85,
            image: m.otherUser?.photos?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
            location: m.otherUser?.city || 'New York, NY'
          })))
          
          setStats({
            newMatches: matchList.length,
            pendingChats: 0,
            profileViews: Math.floor(Math.random() * 50) + 10,
            matchRate: matchList.length > 0 ? 78 : 0
          })
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    loadDashboard()
    return () => { isMounted = false }
  }, [getAccessTokenSilently])

  const quickActions = [
    { icon: Compass, label: 'Discover', path: '/app/discover', color: 'primary', desc: 'Find new roommates' },
    { icon: Heart, label: 'Matches', path: '/app/matches', color: 'accent', desc: 'View your matches' },
    { icon: MessageCircle, label: 'Messages', path: '/app/chat', color: 'success', desc: '5 unread messages' },
    { icon: User, label: 'Profile', path: '/app/profile', color: 'warning', desc: 'Edit your profile' },
  ]

  const statCards = [
    { icon: Flame, label: 'New Matches', value: stats.newMatches, trend: '+2 today', color: 'primary' },
    { icon: Eye, label: 'Profile Views', value: stats.profileViews, trend: '+12 this week', color: 'accent' },
    { icon: TrendingUp, label: 'Match Rate', value: `${stats.matchRate}%`, trend: 'Above average', color: 'success' },
  ]

  if (loading) {
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
      {/* Welcome Header */}
      <motion.div 
        className="mb-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-surface-600 mt-1">
              You have <span className="text-primary-600 font-semibold">{stats.newMatches} new matches</span> waiting for you
            </p>
          </div>
          <motion.button
            className="relative p-3 rounded-xl bg-white shadow-sm border border-surface-200 hover:border-primary-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 text-surface-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-error-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Stats Row */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-surface-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-surface-900">{stat.value}</p>
                    <p className={`text-sm mt-1 ${
                      stat.color === 'primary' ? 'text-primary-600' :
                      stat.color === 'accent' ? 'text-accent-600' : 'text-success-600'
                    }`}>{stat.trend}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    stat.color === 'primary' ? 'bg-primary-100' :
                    stat.color === 'accent' ? 'bg-accent-100' : 'bg-success-100'
                  }`}>
                    <stat.icon className={`w-7 h-7 ${
                      stat.color === 'primary' ? 'text-primary-600' :
                      stat.color === 'accent' ? 'text-accent-600' : 'text-success-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="mb-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={fadeUp} className="text-xl font-semibold text-surface-900 mb-4">
          Quick Actions
        </motion.h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <motion.div key={action.label} variants={fadeUp}>
              <Link to={action.path}>
                <Card className="group cursor-pointer">
                  <CardContent className="p-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                      action.color === 'primary' ? 'bg-primary-100 group-hover:bg-primary-200' :
                      action.color === 'accent' ? 'bg-accent-100 group-hover:bg-accent-200' :
                      action.color === 'success' ? 'bg-success-100 group-hover:bg-success-200' :
                      'bg-warning-100 group-hover:bg-warning-200'
                    }`}>
                      <action.icon className={`w-6 h-6 ${
                        action.color === 'primary' ? 'text-primary-600' :
                        action.color === 'accent' ? 'text-accent-600' :
                        action.color === 'success' ? 'text-success-600' :
                        'text-warning-600'
                      }`} />
                    </div>
                    <h3 className="font-semibold text-surface-900 mb-1">{action.label}</h3>
                    <p className="text-sm text-surface-500">{action.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Matches */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-surface-900">Recent Matches</h2>
          <Link 
            to="/app/matches" 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentMatches.map((match) => (
            <motion.div key={match.id} variants={fadeUp}>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={match.image} 
                      alt={match.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-primary-600">
                      {match.compatibility}% Match
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-surface-900">{match.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-surface-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      {match.location}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1">Message</Button>
                      <Button size="sm" variant="outline" className="flex-1">Profile</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Complete Profile CTA */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.5 }}
      >
        <Card className="bg-linear-to-r from-primary-500 to-accent-500 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Boost Your Profile</h3>
                  <p className="text-white/80">Complete your profile to get 40% more matches</p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                className="bg-white text-primary-600 hover:bg-white/90"
              >
                Complete Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
