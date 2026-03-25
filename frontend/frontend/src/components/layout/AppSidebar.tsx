// @ts-nocheck
import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/app', fill: true },
  { icon: 'group', label: 'Matches', path: '/app/matches', badge: '12' },
  { icon: 'chat', label: 'Messages', path: '/app/chat', dot: true },
  { icon: 'calendar_month', label: 'Calendar', path: '/app/calendar' },
]

const bottomItems = [
  { icon: 'tune', label: 'Filters', path: '/app/filters' },
  { icon: 'settings', label: 'Settings', path: '/app/settings' },
]

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth0()

  const isActive = (path) => {
    if (path === '/app') return location.pathname === '/app'
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-neutral-border z-20">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-border">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-[#166534] rounded-md flex items-center justify-center text-white font-bold text-lg border border-[#14532d] shadow-sm">F</div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold leading-none tracking-tight text-slate-900">Flately</h1>
            <span className="text-xs text-slate-500 font-mono mt-1">v2.4 COMMAND</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link key={item.path} to={item.path}
              className={`group flex items-center gap-3 px-3 py-2 rounded-md transition-colors border ${
                active
                  ? 'bg-mint text-[#166534] font-semibold border-emerald-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent hover:border-slate-200'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${active ? 'icon-fill text-[#166534]' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">{item.badge}</span>
              )}
              {item.dot && (
                <div className="ml-auto size-2 rounded-full bg-[#166534]" />
              )}
            </Link>
          )
        })}

        <div className="my-4 h-px bg-neutral-border mx-3" />

        {bottomItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link key={item.path} to={item.path}
              className={`group flex items-center gap-3 px-3 py-2 rounded-md transition-colors border ${
                active
                  ? 'bg-mint text-[#166534] font-semibold border-emerald-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent hover:border-slate-200'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${active ? 'text-[#166534]' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-neutral-border">
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
          <div
            className="size-8 rounded-full bg-slate-200 bg-cover bg-center border border-slate-200"
            style={{ backgroundImage: `url('${user?.picture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'}')` }}
          />
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold truncate text-slate-900">{user?.name || 'Alex M.'}</span>
            <span className="text-[10px] text-slate-500 font-mono truncate">ID: 8824-XJ</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
