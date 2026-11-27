import { ApiError } from '../http/apiClient'
import { INVALID_ATTACHMENT_MESSAGE, validateAttachment } from './attachments'
import {
  CHAT_ERRORS,
  READ_ONLY_STATUSES,
  type ChatAttachment,
  type ChatEvent,
  type ChatMember,
  type ChatMessage,
  type ChatPerson,
  type ChatProjectRef,
  type ChatProjectStatus,
  type ChatService,
  type ConnectionStatus,
  type ConversationDetail,
  type ConversationSummary,
  type MessagesQuery,
  type SendMessageInput,
} from './types'

/**
 * [HU35-FE] [HU36-FE] [HU37-FE] Chat simulado (modo mock-first).
 * Replica las reglas del backend: solo el creador y los miembros activos acceden
 * (403 NOT_MEMBER), chat de solo lectura si el proyecto terminó (409 PROJECT_CLOSED)
 * y adjuntos PDF/PNG de hasta 10 MB (400 INVALID_FILE).
 */

export interface MockConversation {
  id: string
  project: ChatProjectRef
  status: ChatProjectStatus
  members: ChatMember[]
  messages: (Omit<ChatMessage, 'readByOthers'> & { readBy: string[] })[]
  /** Última lectura por usuario (ISO). */
  reads: Record<string, string>
}

const STORAGE_KEY = 'im.chat'
/** Sesión del servicio de auth simulado (`mockAuthService`). */
const SESSION_KEY = 'im.session'

const person = (id: string, name: string): ChatPerson => ({
  id,
  name,
  initials: name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase(),
  photoUrl: null,
})

const PEOPLE = {
  user1: person('user1', 'User 1'),
  user2: person('user2', 'User 2'),
  lucia: person('seed-lucia', 'Lucía Ramírez'),
  diego: person('seed-diego', 'Diego Torres'),
  sofia: person('seed-sofia', 'Sofía Medina'),
}

const member = (p: ChatPerson, role: string, isLeader = false): ChatMember => ({ ...p, role, isLeader })

function at(daysAgo: number, hours: number, minutes: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

/** Datos semilla: se parecen a los del mockup para probar la pantalla sin backend. */
export function seedConversations(): MockConversation[] {
  return [
    {
      id: 'conv-1',
      project: { id: 'proj-neurobloom', name: 'NeuroBloom', initials: 'NB', coverColor: '#7a5cec' },
      status: 'en_curso',
      members: [
        member(PEOPLE.user1, 'Líder del proyecto', true),
        member(PEOPLE.lucia, 'Product Designer'),
        member(PEOPLE.user2, 'Frontend Developer'),
        member(PEOPLE.diego, 'Backend Developer'),
        member(PEOPLE.sofia, 'Investigación UX'),
      ],
      messages: [
        {
          id: '101',
          author: PEOPLE.lucia,
          text: 'Hola equipo. Subí la primera versión del brief de producto. ¿Le damos una mirada antes de la sesión?',
          sentAt: at(0, 9, 36),
          attachments: [{ id: 'att-1', url: '#', name: 'Brief_producto_v1.pdf', mimeType: 'application/pdf', size: 2_516_582 }],
          readBy: ['seed-lucia', 'user1', 'user2'],
        },
        {
          id: '102',
          author: PEOPLE.user1,
          text: 'Ya lo revisé. La dirección se siente clara, agregué algunas notas sobre el onboarding.',
          sentAt: at(0, 9, 40),
          attachments: [],
          readBy: ['user1', 'seed-lucia'],
        },
        {
          id: '103',
          author: PEOPLE.lucia,
          text: 'Me encanta esa dirección. La vemos juntas en la sesión.',
          sentAt: at(0, 9, 42),
          attachments: [],
          readBy: ['seed-lucia'],
        },
      ],
      reads: { 'seed-lucia': at(0, 9, 42) },
    },
    {
      id: 'conv-2',
      project: { id: 'proj-verde', name: 'Verde Cerca', initials: 'VC', coverColor: '#5fcf9f' },
      status: 'abierto',
      members: [member(PEOPLE.user2, 'Líder del proyecto', true), member(PEOPLE.user1, 'Diseñador UI')],
      messages: [
        {
          id: '201',
          author: PEOPLE.user2,
          text: 'Tienes una nueva actualización',
          sentAt: at(1, 18, 5),
          attachments: [],
          readBy: ['user2'],
        },
      ],
      reads: {},
    },
    {
      id: 'conv-3',
      project: { id: 'proj-orbit', name: 'Orbit Finance', initials: 'OF', coverColor: '#f39a5a' },
      status: 'en_curso',
      members: [member(PEOPLE.diego, 'Líder del proyecto', true), member(PEOPLE.user1, 'Analista'), member(PEOPLE.user2, 'QA')],
      messages: [
        {
          id: '301',
          author: PEOPLE.diego,
          text: 'Tienes una nueva actualización',
          sentAt: at(1, 11, 20),
          attachments: [],
          readBy: ['seed-diego'],
        },
      ],
      reads: {},
    },
    {
      // Proyecto ajeno a las cuentas semilla: sirve para probar el 403.
      id: 'conv-4',
      project: { id: 'proj-atlas', name: 'Atlas Health', initials: 'AH', coverColor: '#3b2a8c' },
      status: 'abierto',
      members: [member(PEOPLE.sofia, 'Líder del proyecto', true)],
      messages: [],
      reads: {},
    },
  ]
}

function currentUserFromSession(): string | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? ((JSON.parse(raw) as { userId?: string }).userId ?? null) : null
  } catch {
    return null
  }
}

function objectUrl(file: File): string {
  return typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : '#'
}

export interface MockChatOptions {
  conversations?: MockConversation[]
  /** Usuario actual; por defecto, el de la sesión simulada. */
  currentUserId?: () => string | null
  /** Guarda en localStorage para que los mensajes sobrevivan a una recarga. */
  persist?: boolean
}

export class MockChatService implements ChatService {
  private conversations: MockConversation[]
  private readonly userId: () => string | null
  private readonly persist: boolean
  private readonly listeners = new Set<(e: ChatEvent) => void>()
  private nextId = 1000

  constructor(opts: MockChatOptions = {}) {
    this.userId = opts.currentUserId ?? currentUserFromSession
    this.persist = opts.persist ?? false
    this.conversations = opts.conversations ?? this.load() ?? seedConversations()
  }

  private load(): MockConversation[] | null {
    if (!this.persist) return null
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as MockConversation[]) : null
    } catch {
      return null
    }
  }

  private save() {
    if (!this.persist) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.conversations))
    } catch {
      /* sin almacenamiento disponible */
    }
  }

  private me(): string {
    const id = this.userId()
    if (!id) throw new ApiError(401, 'UNAUTHORIZED', 'Inicia sesión para continuar.')
    return id
  }

  private participant(conversationId: string): { c: MockConversation; me: string } {
    const me = this.me()
    const c = this.conversations.find((x) => x.id === conversationId)
    if (!c) throw new ApiError(404, CHAT_ERRORS.NOT_FOUND, 'La conversación no existe')
    if (!c.members.some((m) => m.id === me)) {
      throw new ApiError(403, CHAT_ERRORS.NOT_MEMBER, 'Solo el creador y los miembros del equipo pueden acceder al chat')
    }
    return { c, me }
  }

  private toDto(m: MockConversation['messages'][number]): ChatMessage {
    const { readBy, ...rest } = m
    return { ...rest, readByOthers: readBy.some((u) => u !== m.author.id) }
  }

  private emit(event: ChatEvent) {
    for (const l of this.listeners) l(event)
  }

  async list(q?: string): Promise<ConversationSummary[]> {
    const me = this.me()
    const term = q?.trim().toLowerCase() ?? ''
    return this.conversations
      .filter((c) => c.members.some((m) => m.id === me))
      .filter((c) => !term || c.project.name.toLowerCase().includes(term))
      .map((c) => {
        const last = c.messages[c.messages.length - 1]
        const since = c.reads[me]
        return {
          id: c.id,
          project: { ...c.project, status: c.status },
          lastMessage: last
            ? { text: last.text || (last.attachments.length ? 'Archivo adjunto' : ''), authorName: last.author.name, sentAt: last.sentAt }
            : null,
          unreadCount: c.messages.filter((m) => m.author.id !== me && (!since || m.sentAt > since)).length,
          order: last?.sentAt ?? '',
        }
      })
      .sort((a, b) => b.order.localeCompare(a.order))
      .map(({ order: _order, ...rest }) => rest)
  }

  async get(conversationId: string): Promise<ConversationDetail> {
    const { c } = this.participant(conversationId)
    return { id: c.id, project: c.project, projectStatus: c.status, membersCount: c.members.length, members: c.members }
  }

  async messages(conversationId: string, query: MessagesQuery = {}): Promise<ChatMessage[]> {
    const { c } = this.participant(conversationId)
    const limit = query.limit ?? 30
    const all = c.messages
    if (query.after) return all.filter((m) => Number(m.id) > Number(query.after)).slice(0, limit).map((m) => this.toDto(m))
    const pool = query.before ? all.filter((m) => Number(m.id) < Number(query.before)) : all
    return pool.slice(-limit).map((m) => this.toDto(m))
  }

  async send(conversationId: string, input: SendMessageInput): Promise<ChatMessage> {
    const { c, me } = this.participant(conversationId)
    if (READ_ONLY_STATUSES.includes(c.status)) {
      throw new ApiError(409, CHAT_ERRORS.PROJECT_CLOSED, 'El proyecto está cerrado: el chat es de solo lectura')
    }
    const text = input.text?.trim() ?? ''
    if (!text && !input.file) throw new ApiError(400, CHAT_ERRORS.EMPTY_MESSAGE, 'Escribe un mensaje o adjunta un archivo')
    const attachments: ChatAttachment[] = []
    if (input.file) {
      if (validateAttachment(input.file)) throw new ApiError(400, CHAT_ERRORS.INVALID_FILE, INVALID_ATTACHMENT_MESSAGE)
      attachments.push({
        id: `att-${this.nextId}`,
        url: objectUrl(input.file),
        name: input.file.name,
        mimeType: input.file.type || 'application/pdf',
        size: input.file.size,
      })
    }
    const author = c.members.find((m) => m.id === me)!
    const lastId = Math.max(0, ...c.messages.map((m) => Number(m.id)))
    const row = {
      id: String(Math.max(lastId + 1, this.nextId++)),
      author: { id: author.id, name: author.name, initials: author.initials, photoUrl: author.photoUrl ?? null },
      text: text || null,
      sentAt: new Date().toISOString(),
      attachments,
      readBy: [me],
    }
    c.messages.push(row)
    c.reads[me] = row.sentAt
    this.save()
    const message = this.toDto(row)
    this.emit({ type: 'message:new', data: { conversationId, message } })
    return message
  }

  async markRead(conversationId: string): Promise<void> {
    const { c, me } = this.participant(conversationId)
    const now = new Date().toISOString()
    c.reads[me] = now
    for (const m of c.messages) if (!m.readBy.includes(me)) m.readBy.push(me)
    this.save()
    this.emit({ type: 'message:read', data: { conversationId, userId: me, readAt: now } })
  }

  subscribe(listener: (event: ChatEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  onStatus(listener: (status: ConnectionStatus) => void): () => void {
    listener('online')
    return () => {}
  }

  /** Solo para pruebas y demos: saca a un usuario del equipo (HU29/HU30). */
  removeMember(conversationId: string, userId: string) {
    const c = this.conversations.find((x) => x.id === conversationId)
    if (!c) return
    c.members = c.members.filter((m) => m.id !== userId)
    this.save()
    if (userId === this.userId()) this.emit({ type: 'access:revoked', data: { projectId: c.project.id } })
  }
}
