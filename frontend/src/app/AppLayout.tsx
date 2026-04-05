import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'

const navItems = [
  { label: 'Dashboard', path: '/app' },
  { label: 'Discovery', path: '/app/discover' },
  { label: 'Matches', path: '/app/matches' },
  { label: 'Chat', path: '/app/chat' },
  { label: 'Profile', path: '/app/profile' },
]

export function AppLayout() {
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-screen bg-canvas text-slate-900">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-neutral-border bg-surface p-4">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Flately</p>
          <h1 className="text-lg font-semibold">Command Center</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                [
                  'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-emerald-100 bg-mint text-primary'
                    : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={signOut}
          className="rounded-md border border-neutral-border px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        >
          Sign out
        </button>
      </aside>
      <main className="min-w-0 flex-1 p-6">
        <div className="mx-auto w-full max-w-275">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
