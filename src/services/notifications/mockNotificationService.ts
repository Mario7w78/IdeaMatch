import { ApiError } from '../http/apiClient'
import type {
  AppNotification,
  NotificationPayload,
  NotificationService,
  NotificationsConnection,
  NotificationsPage,
  NotificationsQuery,
  NotificationType,
} from './types'

/**
 * [HU31-FE] [HU32-FE] [HU34-FE] Notificaciones simuladas (modo mock-first).
 * Guarda las notificaciones por usuario. `push` y `setConnection` sirven para
 * demos y pruebas: simulan que el backend envía un aviso o que se cae la conexión.
 */

export type MockNotificationStore = Record<string, AppNotification[]>

const STORAGE_KEY = 'im.notifications'
/** Sesión del servicio de auth simulado (`mockAuthService`). */
const SESSION_KEY = 'im.session'

function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

const note = (
  id: string,
  type: NotificationType,
  payload: NotificationPayload,
  minutesAgo: number,
  read = false,
): AppNotification => ({ id, type, payload, read, createdAt: ago(minutesAgo) })

/** Datos semilla: user1 es creador de NeuroBloom y user2 tiene postulaciones resueltas. */
export function seedNotifications(): MockNotificationStore {
  const neuro = { projectId: 'proj-neurobloom', projectName: 'NeuroBloom' }
  return {
    user1: [
      note('n-101', 'application_received', { ...neuro, roleName: 'Product Designer', applicationId: 'app-1' }, 12),
      note('n-102', 'application_received', { ...neuro, roleName: 'Data Analyst', applicationId: 'app-2' }, 95),
      note('n-103', 'application_accepted', { projectId: 'proj-orbit', projectName: 'Orbit Finance', roleName: 'Analista' }, 60 * 26, true),
    ],
    user2: [
      note('n-201', 'application_accepted', { projectId: 'proj-neurobloom', projectName: 'NeuroBloom', roleName: 'Frontend Developer' }, 30),
      note('n-202', 'application_rejected', { projectId: 'proj-atlas', projectName: 'Atlas Health', roleName: 'UX Researcher' }, 60 * 5),
    ],
  }
}

function currentUserFromSession(): string | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? ((JSON.parse(raw) as { userId?: string }).userId ?? null) : null
  } catch {
    return null
  }
}

export interface MockNotificationOptions {
  store?: MockNotificationStore
  /** Usuario actual; por defecto, el de la sesión simulada. */
  currentUserId?: () => string | null
  /** Guarda en localStorage para que el estado sobreviva a una recarga. */
  persist?: boolean
}

export class MockNotificationService implements NotificationService {
  private store: MockNotificationStore
  private readonly userId: () => string | null
  private readonly persist: boolean
  private readonly listeners = new Set<(n: AppNotification) => void>()
  private readonly statusListeners = new Set<(s: NotificationsConnection) => void>()
  private connection: NotificationsConnection = 'online'
  private nextId = 1

  constructor(opts: MockNotificationOptions = {}) {
    this.userId = opts.currentUserId ?? currentUserFromSession
    this.persist = opts.persist ?? false
    this.store = opts.store ?? this.load() ?? seedNotifications()
  }

  private load(): MockNotificationStore | null {
    if (!this.persist) return null
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as MockNotificationStore) : null
    } catch {
      return null
    }
  }

  private save() {
    if (!this.persist) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store))
    } catch {
      /* sin almacenamiento disponible */
    }
  }

  private me(): string {
    const id = this.userId()
    if (!id) throw new ApiError(401, 'UNAUTHORIZED', 'Inicia sesión para continuar.')
    return id
  }

  private mine(): AppNotification[] {
    const me = this.me()
    this.store[me] ??= []
    return this.store[me]
  }

  async list(query: NotificationsQuery = {}): Promise<NotificationsPage> {
    const all = [...this.mine()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const items = query.unreadOnly ? all.filter((n) => !n.read) : all
    return { unreadCount: all.filter((n) => !n.read).length, items: items.map((n) => ({ ...n })) }
  }

  async markRead(id: string): Promise<void> {
    const n = this.mine().find((x) => x.id === id)
    if (!n) throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', 'La notificación no existe')
    n.read = true
    this.save()
  }

  async markAllRead(): Promise<void> {
    for (const n of this.mine()) n.read = true
    this.save()
  }

  subscribe(listener: (n: AppNotification) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  onStatus(listener: (s: NotificationsConnection) => void): () => void {
    this.statusListeners.add(listener)
    listener(this.connection)
    return () => this.statusListeners.delete(listener)
  }

  /**
   * Demo/pruebas: el «backend» registra una notificación para `userId`.
   * Si hay conexión y es el usuario actual, llega en vivo; si no, se verá al sincronizar.
   */
  push(userId: string, type: NotificationType, payload: NotificationPayload): AppNotification {
    const n: AppNotification = {
      id: `n-live-${Date.now()}-${this.nextId++}`,
      type,
      payload,
      read: false,
      createdAt: new Date().toISOString(),
    }
    ;(this.store[userId] ??= []).push(n)
    this.save()
    if (this.connection === 'online' && userId === this.userId()) {
      for (const l of this.listeners) l({ ...n })
    }
    return n
  }

  /** Demo/pruebas: simula que la conexión en tiempo real se cae o vuelve. */
  setConnection(status: NotificationsConnection) {
    if (status === this.connection) return
    this.connection = status
    for (const l of this.statusListeners) l(status)
  }
}
