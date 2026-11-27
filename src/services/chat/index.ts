import { isApiEnabled } from '../http/apiClient'
import { httpChatService } from './httpChatService'
import { MockChatService } from './mockChatService'
import type { ChatService } from './types'

export * from './types'
export * from './attachments'
export { MockChatService, seedConversations } from './mockChatService'

export const chatService: ChatService = isApiEnabled() ? httpChatService : new MockChatService({ persist: true })
