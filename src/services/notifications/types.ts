/**
 * [HU31-FE] [HU32-FE] [HU34-FE] Contrato de las notificaciones in-app.
 * Refleja `docs/API_ENDPOINTS.md`: `GET /notifications`, `POST /notifications/:id/read`,
 * `POST /notifications/read-all` y el evento `notification:new` del WebSocket `/ws`.
 *
 * Los nombres de `type` y de los campos de `payload` se acuerdan con Dev 3 (backend).
 */

export type NotificationType =
  /** HU31: alguien se postuló a un rol de un proyecto del creador. */
  | 'application_received'
  /** HU32: la postulación del usuario fue aceptada. */
  | 'application_accepted'
  /** HU32: la postulación del usuario fue rechazada. */
  | 'application_rejected'
  /** HU30/HU36: el usuario fue removido del equipo. */
  | 'member_removed'

export interface NotificationPayload {
  projectId?: string
  projectName?: string
  roleName?: string
  applicationId?: string
  [key: string]: unknown
}

export interface AppNotification {
  id: string
  /** Tipos conocidos u otro que el backend agregue más adelante. */
  type: NotificationType | (string & {})
  payload: NotificationPayload
  read: boolean
  createdAt: string
}

export interface NotificationsPage {
  unreadCount: number
  items: AppNotification[]
}

export interface NotificationsQuery {
  unreadOnly?: boolean
}

/** Estado de la conexión en tiempo real (el mismo socket que usa el chat). */
export type NotificationsConnection = 'connecting' | 'online' | 'offline'

export interface NotificationService {
  list(query?: NotificationsQuery): Promise<NotificationsPage>
  markRead(id: string): Promise<void>
  markAllRead(): Promise<void>
  /** Avisa de cada notificación nueva en vivo. Devuelve la función para cancelar. */
  subscribe(listener: (notification: AppNotification) => void): () => void
  /** Suscribe al estado de conexión (se llama de inmediato con el actual). */
  onStatus(listener: (status: NotificationsConnection) => void): () => void
}

/** HU34: texto del panel vacío. */
export const EMPTY_NOTIFICATIONS_MESSAGE = 'No tienes notificaciones registradas'

/** HU31: a partir de cuántas postulaciones sin leer se agrupan en un solo aviso. */
export const GROUP_THRESHOLD = 5
