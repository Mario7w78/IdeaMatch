import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/useAuth'
import {
  notificationService,
  type AppNotification,
  type NotificationService,
  type NotificationsPage,
} from '../services/notifications'

export interface UseNotifications {
  items: AppNotification[]
  unreadCount: number
  loading: boolean
  error: string | null
  /** Última notificación que llegó en vivo (para la alerta de la campana). */
  latest: AppNotification | null
  dismissLatest: () => void
  markRead: (ids: string[]) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => Promise<void>
}

const LOAD_ERROR = 'No se pudieron cargar las notificaciones. Inténtalo de nuevo.'

/**
 * [HU31-FE] [HU32-FE] [HU34-FE] Estado de las notificaciones del usuario:
 * carga inicial, avisos en vivo, sincronización al reconectarse y marcado como leídas.
 */
export function useNotifications(service: NotificationService = notificationService): UseNotifications {
  const { session } = useAuth()
  const userId = session?.user.id ?? null
  const [items, setItems] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [latest, setLatest] = useState<AppNotification | null>(null)
  /** Ids ya mostrados, para no contar dos veces un aviso repetido. */
  const known = useRef(new Set<string>())

  const apply = useCallback((page: NotificationsPage) => {
    known.current = new Set(page.items.map((n) => n.id))
    setItems(page.items)
    setUnreadCount(page.unreadCount)
    setError(null)
    setLoading(false)
  }, [])

  const fail = useCallback(() => {
    setError(LOAD_ERROR)
    setLoading(false)
  }, [])

  const refresh = useCallback(() => service.list().then(apply, fail), [service, apply, fail])

  // Carga inicial (y al cambiar de usuario).
  useEffect(() => {
    if (!userId) return
    let alive = true
    service.list().then(
      (page) => alive && apply(page),
      () => alive && fail(),
    )
    return () => {
      alive = false
    }
  }, [userId, service, apply, fail])

  useEffect(() => {
    if (!userId) return
    const offEvents = service.subscribe((n) => {
      if (known.current.has(n.id)) return
      known.current.add(n.id)
      setItems((prev) => [n, ...prev])
      if (!n.read) setUnreadCount((c) => c + 1)
      setLatest(n)
    })
    // HU32: si la conexión se cae y vuelve, se traen las alertas que llegaron mientras tanto.
    let wasOnline = false
    let dropped = false
    const offStatus = service.onStatus((status) => {
      if (status === 'online') {
        if (dropped) void refresh()
        wasOnline = true
        dropped = false
      } else if (wasOnline) {
        dropped = true
      }
    })
    return () => {
      offEvents()
      offStatus()
    }
  }, [userId, service, refresh])

  const markRead = useCallback(
    async (ids: string[]) => {
      const unread = new Set(items.filter((n) => ids.includes(n.id) && !n.read).map((n) => n.id))
      if (unread.size === 0) return
      setItems((prev) => prev.map((n) => (unread.has(n.id) ? { ...n, read: true } : n)))
      setUnreadCount((c) => Math.max(0, c - unread.size))
      try {
        await Promise.all([...unread].map((id) => service.markRead(id)))
      } catch {
        await refresh()
      }
    },
    [items, service, refresh],
  )

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })))
    setUnreadCount(0)
    setLatest(null)
    try {
      await service.markAllRead()
    } catch {
      await refresh()
      setError('No se pudieron marcar como leídas. Inténtalo de nuevo.')
    }
  }, [service, refresh])

  const dismissLatest = useCallback(() => setLatest(null), [])

  return { items, unreadCount, loading, error, latest, dismissLatest, markRead, markAllRead, refresh }
}
