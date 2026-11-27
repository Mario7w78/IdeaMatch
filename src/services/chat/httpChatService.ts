import { apiRequest } from '../http/apiClient'
import { realtime } from '../http/realtime'
import type { ChatEvent, ChatMessage, ChatService, ConversationDetail, ConversationSummary } from './types'

const conv = (id: string) => `/conversations/${encodeURIComponent(id)}`

/** [HU35-FE] [HU36-FE] [HU37-FE] El backend valida la pertenencia (403 NOT_MEMBER) en cada petición. */
export const httpChatService: ChatService = {
  list: (q) => apiRequest<ConversationSummary[]>('/conversations', { query: { q: q?.trim() || undefined } }),

  get: (id) => apiRequest<ConversationDetail>(conv(id)),

  messages: (id, query = {}) =>
    apiRequest<ChatMessage[]>(`${conv(id)}/messages`, {
      query: { before: query.before, after: query.after, limit: query.limit },
    }),

  async send(id, { text, file }) {
    const clean = text?.trim()
    let body: unknown = { text: clean }
    if (file) {
      const form = new FormData()
      form.append('file', file)
      if (clean) form.append('text', clean)
      body = form
    }
    const res = await apiRequest<{ message: ChatMessage }>(`${conv(id)}/messages`, { method: 'POST', body })
    return res.message
  },

  markRead: (id) => apiRequest<void>(`${conv(id)}/read`, { method: 'POST' }),

  subscribe: (listener) =>
    realtime.subscribe((msg) => {
      if (msg.type === 'message:new' || msg.type === 'message:read') {
        listener(msg as ChatEvent)
        return
      }
      // HU36: al ser removido llega `notification:new` de tipo `member_removed`.
      if (msg.type === 'notification:new') {
        const n = (msg.data as { notification?: { type?: string; payload?: { projectId?: unknown } } }).notification
        if (n?.type === 'member_removed' && n.payload?.projectId != null) {
          listener({ type: 'access:revoked', data: { projectId: String(n.payload.projectId) } })
        }
      }
    }),

  onStatus: (listener) => realtime.onStatus(listener),
}
