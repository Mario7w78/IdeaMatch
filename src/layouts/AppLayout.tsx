import { Bell, LogOut, Menu, Plus, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { buttonClasses } from '../components/ui/buttonClasses'
import { Logo } from '../components/ui/Logo'
import { useAuth } from '../context/useAuth'
import { NAV_ITEMS } from './navigation'

/** Layout autenticado: barra lateral + barra superior (Inicio, Explorar, etc.). */
export function AppLayout() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[264px_1fr]">
      {/* Barra lateral (escritorio) */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-white lg:flex">
        <Sidebar />
      </aside>

      {/* Barra lateral (móvil) */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <button
            className="absolute inset-0 bg-ink/40"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-[300px] max-w-[85vw] flex-col bg-white shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-4 rounded-lg p-2 text-muted hover:bg-surface"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:px-8 lg:h-[72px] lg:px-10">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-ink hover:bg-surface lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <label className="hidden h-11 w-full max-w-[440px] items-center gap-3 rounded-xl border border-line bg-surface px-4 md:flex">
            <Search size={18} className="text-ink" aria-hidden="true" />
            <span className="sr-only">Buscar</span>
            <input
              type="search"
              placeholder="Buscar proyectos, habilidades o personas…"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-subtle"
            />
          </label>
          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <button
              className="relative grid size-11 place-items-center rounded-xl border border-line bg-white text-ink hover:bg-surface"
              aria-label="Notificaciones"
            >
              <Bell size={20} />
            </button>
            <Link to="/app/publicar" className={buttonClasses('primary', 'md', 'px-4!')}>
              <Plus size={20} aria-hidden="true" />
              <span className="hidden sm:inline">Publicar una idea</span>
              <span className="sm:hidden">Publicar</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)
  const user = session?.user
  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : ''

  async function handleLogout() {
    setLeaving(true)
    navigate('/', { replace: true })
    await logout()
  }

  return (
    <>
      <div className="px-6 pt-7 pb-6">
        <Logo to="/app" />
      </div>
      <nav aria-label="Principal" className="flex-1 overflow-y-auto px-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/app'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex h-11 items-center gap-3 rounded-xl px-4 text-[15px] transition-colors ${
                    isActive ? 'bg-brand-100 font-semibold text-brand-700' : 'text-muted hover:bg-surface hover:text-ink'
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {user && (
        <div className="flex items-center gap-3 border-t border-line px-5 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">
            {initials}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold" title={`${user.firstName} ${user.lastName}`}>
            {user.firstName} {user.lastName}
          </span>
          <button
            onClick={handleLogout}
            disabled={leaving}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-surface hover:text-ink disabled:opacity-60"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={16} aria-hidden="true" />
            Salir
          </button>
        </div>
      )}
    </>
  )
}
