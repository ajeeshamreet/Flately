// @ts-nocheck
import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link, useNavigate } from 'react-router-dom'

export function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#166534] rounded-md flex items-center justify-center shadow-sm border border-[#14532d]">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Flately</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">How It Works</a>
            <a href="#trust" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">Safety</a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button onClick={() => navigate('/app')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Dashboard
                </button>
                <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => loginWithRedirect()} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Log in
                </button>
                <button onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })} className="px-4 py-2 text-sm font-bold bg-[#166534] text-white rounded-lg hover:bg-[#14532d] transition-colors shadow-sm">
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className="material-symbols-outlined text-slate-700">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col gap-2">
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#trust" className="text-slate-600 hover:text-slate-900 font-medium py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Safety</a>
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-slate-200">
                {isAuthenticated ? (
                  <>
                    <button onClick={() => { navigate('/app'); setMobileMenuOpen(false) }} className="py-2 px-3 text-sm font-medium text-slate-600 hover:text-slate-900 text-left">Dashboard</button>
                    <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="py-2 px-3 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 text-left">Logout</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => loginWithRedirect()} className="py-2 px-3 text-sm font-medium text-slate-600 text-left">Log in</button>
                    <button onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })} className="py-2 px-3 text-sm font-bold bg-[#166534] text-white rounded-lg text-left">Sign up</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
