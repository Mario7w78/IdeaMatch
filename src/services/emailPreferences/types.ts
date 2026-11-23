/** Eventos por los que el usuario puede recibir un correo (HU33). */
export type EmailEvent =
  | 'new_application'
  | 'application_status'
  | 'chat_messages'
  | 'project_updates'

export const EMAIL_EVENTS: { id: EmailEvent; label: string; description: string }[] = [
  {
    id: 'new_application',
    label: 'Nuevas postulaciones',
    description: 'Cuando alguien postula a un rol de tus proyectos.',
  },
  {
    id: 'application_status',
    label: 'Respuesta a mis postulaciones',
    description: 'Cuando un creador acepta o rechaza tu postulación.',
  },
  {
    id: 'chat_messages',
    label: 'Mensajes del chat',
    description: 'Cuando tu equipo escribe en el chat del proyecto.',
  },
  {
    id: 'project_updates',
    label: 'Cambios en mis proyectos',
    description: 'Cuando cambia el estado de un proyecto en el que participas.',
  },
]

export interface EmailPreferences {
  userId: string
  /** Interruptor general: si está apagado no se envía ningún correo. */
  enabled: boolean
  events: Record<EmailEvent, boolean>
  updatedAt: string
}

export interface UpdateEmailPreferencesInput {
  enabled?: boolean
  events?: Partial<Record<EmailEvent, boolean>>
}

export type EmailPreferencesErrorCode = 'SAVE_FAILED'

export class EmailPreferencesError extends Error {
  readonly code: EmailPreferencesErrorCode
  constructor(code: EmailPreferencesErrorCode, message: string) {
    super(message)
    this.name = 'EmailPreferencesError'
    this.code = code
  }
}

/**
 * Contrato del servicio de preferencias de correo (HU33).
 * `shouldSendEmail` lo consulta el backend antes de enviar cada correo.
 */
export interface EmailPreferencesService {
  getPreferences(userId: string): Promise<EmailPreferences>
  updatePreferences(userId: string, input: UpdateEmailPreferencesInput): Promise<EmailPreferences>
  shouldSendEmail(userId: string, event: EmailEvent): Promise<boolean>
}
