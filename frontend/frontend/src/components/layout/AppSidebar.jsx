import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
// framer-motion available for future animations
import { 
  LayoutDashboard, 
  Compass, 
  Heart, 
  MessageCircle, 
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronLeft
} from 'lucide-react'

const spring = { type: 'spring', stiffness: 300, damping: 30 }

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: Compass, label: 'Discover', path: '/app/discover' },
  { icon: Heart, label: 'Matches', path: '/app/matches' },
  { icon: MessageCircle, label: 'Messages', path: '/app/chat', badge: 5 },
]

const bottomItems = [
  { icon: User, label: 'Profile', path: '/app/profile' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
  { icon: HelpCircle, label: 'Help', path: '/app/help' },
]

export function AppSidebar({ isCollapsed, onToggle }) {
  const location = useLocation()
  const { user, logout } = useAuth0()

  const isActive = (path) => {
    if (path === '/app') return location.pathname === '/app'
    return location.pathname.startsWith(path)
  }

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen bg-white border-r border-surface-200 flex flex-col z-40"
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={spring}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-100">
        <Link to="/app" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <motion.span 
            className="font-bold text-xl text-surface-900"
            initial={false}
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
            transition={{ duration: 0.15 }}
          >
            Flately
          </motion.span>
        </Link>
        <motion.button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-surface-100 transition-colors hidden lg:flex"
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={spring}
        >
          <ChevronLeft className="w-5 h-5 text-surface-500" />
        </motion.button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
                  active 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                }`}
                whileHover={{ x: 4 }}
                transition={spring}
              >
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                    transition={spring}
                  />
                )}
                <item.icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary-600' : ''}`} />
                <motion.span 
                  className="font-medium whitespace-nowrap"
                  initial={false}
                  animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
                {item.badge && !isCollapsed && (
                  <span className="ml-auto px-2 py-0.5 bg-primary-500 text-white text-xs font-medium rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.badge && isCollapsed && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="py-4 px-3 space-y-1 border-t border-surface-100">
        {bottomItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  active 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900'
                }`}
                whileHover={{ x: 4 }}
                transition={spring}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <motion.span 
                  className="text-sm font-medium whitespace-nowrap"
                  initial={false}
                  animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </Link>
          )
        })}
      </div>

      {/* User Section */}
      <div className="p-3 border-t border-surface-100">
        <div className={`flex items-center gap-3 p-2 rounded-xl ${isCollapsed ? 'justify-center' : ''}`}>
          <img 
            src={user?.picture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'} 
            alt={user?.name}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          {!isCollapsed && (
            <motion.div 
              className="flex-1 min-w-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="font-medium text-sm text-surface-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-surface-500 truncate">{user?.email}</p>
            </motion.div>
          )}
        </div>
        
        <motion.button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className={`mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-error-600 hover:bg-error-50 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          whileHover={{ x: isCollapsed ? 0 : 4 }}
          transition={spring}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Log out</span>}
        </motion.button>
      </div>
    </motion.aside>
  )
}
