import { GROUP_THRESHOLD, type AppNotification } from './types'

/** Una fila del panel: una notificación o un grupo de postulaciones (HU31). */
export interface NotificationEntry {
  key: string
  /** Ids de las notificaciones que representa (más de uno si es un grupo). */
  ids: string[]
  text: string
  /** Línea secundaria (nombre del proyecto). */
  detail?: string
  read: boolean
  createdAt: string
  /** A dónde lleva al hacer clic. */
  to: string
  grouped: boolean
}

const role = (n: AppNotification) => String(n.payload.roleName ?? n.payload.role ?? 'sin nombre')
const project = (n: AppNotification) => (n.payload.projectName ? String(n.payload.projectName) : undefined)

/** Texto de una notificación, con los mensajes de los criterios de aceptación. */
export function notificationText(n: AppNotification): string {
  switch (n.type) {
    case 'application_received':
      return `Tienes una nueva postulación para el rol ${role(n)}`
    case 'application_accepted':
      return `Tu postulación para el rol ${role(n)} fue aceptada`
    case 'application_rejected':
      return `Tu postulación para el rol ${role(n)} fue rechazada`
    case 'member_removed':
      return project(n) ? `Ya no formas parte del equipo de ${project(n)}` : 'Ya no formas parte de este equipo'
    default:
      return typeof n.payload.message === 'string' ? n.payload.message : 'Tienes una nueva notificación'
  }
}

/** Ruta a la que lleva una notificación. */
export function notificationLink(n: AppNotification): string {
  const id = n.payload.projectId ? encodeURIComponent(String(n.payload.projectId)) : null
  switch (n.type) {
    case 'application_received':
      return id ? `/app/proyecto/${id}/postulaciones` : '/app/mis-proyectos'
    case 'application_accepted':
    case 'application_rejected':
      return '/app/postulaciones'
    default:
      return '/app'
  }
}

/** HU31: «Tienes 5 postulaciones pendientes». */
export const groupedApplicationsText = (count: number) => `Tienes ${count} postulaciones pendientes`

/**
 * Arma las filas del panel, de la más nueva a la más vieja.
 * HU31: si hay `GROUP_THRESHOLD` o más postulaciones nuevas sin leer, se muestran como un solo aviso.
 */
export function buildEntries(items: AppNotification[]): NotificationEntry[] {
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const pendingApps = sorted.filter((n) => n.type === 'application_received' && !n.read)
  const group = pendingApps.length >= GROUP_THRESHOLD
  const entries: NotificationEntry[] = []
  let groupAdded = false

  for (const n of sorted) {
    if (group && n.type === 'application_received' && !n.read) {
      if (groupAdded) continue
      groupAdded = true
      const projects = new Set(pendingApps.map((p) => p.payload.projectId).filter(Boolean))
      const [only] = projects
      entries.push({
        key: `group-${n.id}`,
        ids: pendingApps.map((p) => p.id),
        text: groupedApplicationsText(pendingApps.length),
        detail: projects.size === 1 ? project(n) : undefined,
        read: false,
        createdAt: n.createdAt,
        to: projects.size === 1 ? `/app/proyecto/${encodeURIComponent(String(only))}/postulaciones` : '/app/mis-proyectos',
        grouped: true,
      })
      continue
    }
    entries.push({
      key: n.id,
      ids: [n.id],
      text: notificationText(n),
      detail: project(n),
      read: n.read,
      createdAt: n.createdAt,
      to: notificationLink(n),
      grouped: false,
    })
  }
  return entries
}

/** «Ahora», «Hace 5 min», «Hace 3 h», «Hace 2 d». */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000))
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  return `Hace ${Math.floor(hours / 24)} d`
}
