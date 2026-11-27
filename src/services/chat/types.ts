/**
 * [HU35-FE] [HU36-FE] [HU37-FE] Contrato del chat grupal por proyecto.
 * Refleja el módulo «Mensajería» del backend (`/api/conversations`, WebSocket `/ws`).
 */

/** Estados del proyecto tal como los devuelve el backend. */
export type ChatProjectStatus =
  | 'borrador'
  | 'abierto'
  | 'en_curso'
  | 'pausado'
  | 'cerrado'
  | 'cancelado'
  | 'suspendido'

export interface ChatPerson {
  id: string
  name: string
  initials: string
  photoUrl?: string | null
}

export interface ChatAttachment {
  id: string
  url: string
  name: string
  mimeType: string
  /** Tamaño en bytes. */
  size: number
}

export interface ChatMessage {
  id: string
  author: ChatPerson
  text: string | null
  sentAt: string
  /** Algún otro integrante abrió la conversación después de este mensaje («Visto»). */
  readByOthers: boolean
  attachments: ChatAttachment[]
}

export interface ChatProjectRef {
  id: string
  name: string
  initials: string
  coverColor?: string
}

export interface ConversationSummary {
  id: string
  project: ChatProjectRef & { status?: ChatProjectStatus }
  lastMessage: { text: string; authorName: string; sentAt: string } | null
  unreadCount: number
}

export interface ChatMember extends ChatPerson {
  role: string
  isLeader: boolean
}

export interface ConversationDetail {
  id: string
  project: ChatProjectRef
  projectStatus: ChatProjectStatus
  membersCount: number
  members: ChatMember[]
}

export interface MessagesQuery {
  /** Mensajes anteriores a este id (cargar historial). */
  before?: string
  /** Mensajes posteriores a este id (sincronizar tras reconexión). */
  after?: string
  limit?: number
}

export interface SendMessageInput {
  text?: string
  file?: File
}

/** Estado de la conexión en tiempo real. */
export type ConnectionStatus = 'connecting' | 'online' | 'offline'

export type ChatEvent =
  | { type: 'message:new'; data: { conversationId: string; message: ChatMessage } }
  | { type: 'message:read'; data: { conversationId: string; userId: string; readAt: string } }
  /** [HU36-FE] El usuario fue removido del equipo de `projectId` (notificación `member_removed`). */
  | { type: 'access:revoked'; data: { projectId: string } }

export interface ChatService {
  list(q?: string): Promise<ConversationSummary[]>
  get(conversationId: string): Promise<ConversationDetail>
  messages(conversationId: string, query?: MessagesQuery): Promise<ChatMessage[]>
  send(conversationId: string, input: SendMessageInput): Promise<ChatMessage>
  markRead(conversationId: string): Promise<void>
  /** Suscribe a los eventos en vivo. Devuelve la función para cancelar. */
  subscribe(listener: (event: ChatEvent) => void): () => void
  /** Suscribe al estado de conexión (se llama de inmediato con el actual). */
  onStatus(listener: (status: ConnectionStatus) => void): () => void
}

/** Códigos de error del backend que la pantalla trata de forma especial. */
export const CHAT_ERRORS = {
  NOT_MEMBER: 'NOT_MEMBER',
  NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  PROJECT_CLOSED: 'PROJECT_CLOSED',
  INVALID_FILE: 'INVALID_FILE',
  EMPTY_MESSAGE: 'EMPTY_MESSAGE',
} as const

/** Estados en los que el chat queda en solo lectura. */
export const READ_ONLY_STATUSES: readonly ChatProjectStatus[] = ['cerrado', 'cancelado', 'suspendido']
