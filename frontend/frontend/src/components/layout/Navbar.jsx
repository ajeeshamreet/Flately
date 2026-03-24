import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { Button } from '../ui'
import { cn } from '@/lib/utils'

const spring = { type: 'spring', stiffness: 400, damping: 30 }

export function Navbar({ className }) {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#trust', label: 'Safety' },
  ]

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={spring}
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-white/80 backdrop-blur-xl border-b border-surface-200/50',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div 
              className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30"
              whileHover={{ scale: 1.05, rotate: -3 }}
              transition={spring}
            >
              <span className="text-white font-bold text-xl">F</span>
            </motion.div>
            <span className="text-xl font-bold text-surface-900">
              Flately
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-surface-600 hover:text-surface-900 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/app')}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loginWithRedirect()}
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-surface-700" />
            ) : (
              <Menu className="w-6 h-6 text-surface-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-surface-200">
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-surface-600 hover:text-surface-900 font-medium py-2 px-3 rounded-lg hover:bg-surface-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-surface-200">
                    {isAuthenticated ? (
                      <>
                        <Button variant="ghost" onClick={() => { navigate('/app'); setMobileMenuOpen(false) }}>
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                          <LogOut className="w-4 h-4" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" onClick={() => loginWithRedirect()}>
                          Log in
                        </Button>
                        <Button onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}>
                          Sign up
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
