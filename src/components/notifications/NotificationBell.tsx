import { Bell, BellRing, CheckCheck, Users, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import {
  buildEntries,
  EMPTY_NOTIFICATIONS_MESSAGE,
  notificationText,
  relativeTime,
  type NotificationEntry,
  type NotificationService,
} from '../../services/notifications'
import { Alert } from '../ui/Alert'

/** Cuánto se ve la alerta de una notificación nueva. */
const TOAST_MS = 6000

/**
 * [HU31-FE] [HU32-FE] [HU34-FE] Campana de la barra superior:
 * indicador rojo con el número sin leer, alerta al llegar un aviso y panel de notificaciones.
 */
export function NotificationBell({ service }: { service?: NotificationService }) {
  const n = useNotifications(service)
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const entries = useMemo(() => buildEntries(n.items), [n.items])
  const { latest, dismissLatest } = n

  // Cerrar con Escape o al hacer clic fuera.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open])

  // La alerta se oculta sola.
  useEffect(() => {
    if (!latest) return
    const t = setTimeout(dismissLatest, TOAST_MS)
    return () => clearTimeout(t)
  }, [latest, dismissLatest])

  const count = n.unreadCount
  const label = count > 0 ? `Notificaciones, ${count} sin leer` : 'Notificaciones'
  const toggle = () => {
    setOpen((v) => !v)
    dismissLatest()
  }

  return (
    <div ref={box} className="relative">
      <button
        ref={button}
        onClick={toggle}
        className="relative grid size-11 place-items-center rounded-xl border border-line bg-white text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        {count > 0 ? <BellRing size={20} aria-hidden="true" /> : <Bell size={20} aria-hidden="true" />}
        {count > 0 && (
          <span
            data-testid="notification-badge"
            className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-danger-600 px-1 text-[11px] leading-none font-bold text-white ring-2 ring-white"
            aria-hidden="true"
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {latest && !open && (
        <div className="absolute top-full right-0 z-40 mt-2 w-[320px] max-w-[calc(100vw-2rem)] shadow-lg">
          <Alert tone="info">
            <div className="flex items-start gap-2">
              <button onClick={toggle} className="flex-1 text-left font-semibold hover:underline">
                {notificationText(latest)}
              </button>
              <button onClick={dismissLatest} className="rounded p-0.5 hover:bg-brand-100" aria-label="Cerrar alerta">
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          </Alert>
        </div>
      )}

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notificaciones"
          className="absolute top-full right-0 z-40 mt-2 flex max-h-[min(560px,calc(100dvh-96px))] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-xl"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-ink">Notificaciones</h2>
              <p className="text-xs text-muted">{count > 0 ? `${count} sin leer` : 'Todo al día'}</p>
            </div>
            <button
              onClick={() => void n.markAllRead()}
              disabled={count === 0}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-subtle disabled:hover:bg-transparent"
            >
              <CheckCheck size={16} aria-hidden="true" />
              Marcar todas como leídas
            </button>
          </div>

          {n.error && (
            <div className="px-4 pt-3">
              <Alert tone="error">{n.error}</Alert>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {n.loading ? (
              <p className="px-5 py-10 text-center text-sm text-muted">Cargando…</p>
            ) : entries.length === 0 ? (
              <div className="grid place-items-center gap-3 px-6 py-12 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-surface text-subtle">
                  <Bell size={22} aria-hidden="true" />
                </span>
                <p className="text-sm font-medium text-muted">{EMPTY_NOTIFICATIONS_MESSAGE}</p>
              </div>
            ) : (
              <ul aria-label="Lista de notificaciones" className="divide-y divide-line">
                {entries.map((e) => (
                  <NotificationRow
                    key={e.key}
                    entry={e}
                    onOpen={() => {
                      void n.markRead(e.ids)
                      setOpen(false)
                    }}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationRow({ entry: e, onOpen }: { entry: NotificationEntry; onOpen: () => void }) {
  return (
    <li>
      <Link
        to={e.to}
        onClick={onOpen}
        className={`flex gap-3 px-5 py-3.5 hover:bg-surface focus-visible:bg-surface focus-visible:outline-none ${e.read ? '' : 'bg-brand-50/60'}`}
      >
        <span
          className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${e.read ? 'bg-surface text-muted' : 'bg-brand-100 text-brand-700'}`}
        >
          {e.grouped ? <Users size={17} aria-hidden="true" /> : <Bell size={17} aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-sm ${e.read ? 'text-ink-soft' : 'font-semibold text-ink'}`}>{e.text}</span>
          <span className="mt-0.5 block text-xs text-muted">
            {e.detail ? `${e.detail} · ` : ''}
            {relativeTime(e.createdAt)}
          </span>
        </span>
        {!e.read && (
          <span className="mt-2 size-2.5 shrink-0 rounded-full bg-danger-600">
            <span className="sr-only">Sin leer</span>
          </span>
        )}
      </Link>
    </li>
  )
}
