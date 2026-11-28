import { apiRequest } from '../http/apiClient'
import { realtime } from '../http/realtime'
import type { AppNotification, NotificationService, NotificationsPage } from './types'

/** [HU31-FE] [HU32-FE] [HU34-FE] Notificaciones contra el backend real. */
export const httpNotificationService: NotificationService = {
  list: (query = {}) =>
    apiRequest<NotificationsPage>('/notifications', { query: { unreadOnly: query.unreadOnly ? 'true' : undefined } }),

  markRead: (id) => apiRequest<void>(`/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' }),

  markAllRead: () => apiRequest<void>('/notifications/read-all', { method: 'POST' }),

  subscribe: (listener) =>
    realtime.subscribe((msg) => {
      if (msg.type !== 'notification:new') return
      const n = (msg.data as { notification?: AppNotification } | null)?.notification
      if (n && typeof n.id !== 'undefined') listener({ ...n, id: String(n.id), payload: n.payload ?? {} })
    }),

  onStatus: (listener) => realtime.onStatus(listener),
}
