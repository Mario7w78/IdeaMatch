import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../http/apiClient'
import { INVALID_ATTACHMENT_MESSAGE, formatBytes, validateAttachment } from './attachments'
import { MockChatService, seedConversations } from './mockChatService'

const asUser = (id: string | null) => new MockChatService({ conversations: seedConversations(), currentUserId: () => id })
const file = (name: string, type: string, size: number) => {
  const f = new File(['x'], name, { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

async function codeOf(p: Promise<unknown>) {
  try {
    await p
  } catch (e) {
    return e instanceof ApiError ? `${e.status} ${e.code}` : String(e)
  }
  return 'ok'
}

describe('[HU35-FE] MockChatService', () => {
  it('lista solo los chats de los proyectos donde participa, el más reciente primero', async () => {
    const svc = asUser('user1')
    const list = await svc.list()
    expect(list.map((c) => c.project.name)).toEqual(['NeuroBloom', 'Verde Cerca', 'Orbit Finance'])
    expect(list[0].lastMessage?.text).toBe('Me encanta esa dirección. La vemos juntas en la sesión.')
    expect(await svc.list('orbit')).toHaveLength(1)
  })

  it('envía un mensaje, lo emite en vivo y lo devuelve en el historial', async () => {
    const svc = asUser('user1')
    const listener = vi.fn()
    svc.subscribe(listener)
    const msg = await svc.send('conv-1', { text: '  Hola equipo  ' })
    expect(msg.text).toBe('Hola equipo')
    expect(listener).toHaveBeenCalledWith({ type: 'message:new', data: { conversationId: 'conv-1', message: msg } })
    const all = await svc.messages('conv-1')
    expect(all[all.length - 1].id).toBe(msg.id)
    expect(await svc.messages('conv-1', { after: '102' })).toHaveLength(2)
    expect(await svc.messages('conv-1', { before: '102' })).toHaveLength(1)
  })

  it('marcar como leída deja el contador en cero', async () => {
    const svc = asUser('user1')
    expect((await svc.list()).find((c) => c.id === 'conv-2')?.unreadCount).toBe(1)
    await svc.markRead('conv-2')
    expect((await svc.list()).find((c) => c.id === 'conv-2')?.unreadCount).toBe(0)
  })

  it('[HU36-FE] responde 403 NOT_MEMBER a quien no integra el equipo', async () => {
    const svc = asUser('user1')
    expect(await codeOf(svc.get('conv-4'))).toBe('403 NOT_MEMBER')
    expect(await codeOf(svc.messages('conv-4'))).toBe('403 NOT_MEMBER')
    expect(await codeOf(svc.send('conv-4', { text: 'hola' }))).toBe('403 NOT_MEMBER')
    expect(await codeOf(svc.get('no-existe'))).toBe('404 CONVERSATION_NOT_FOUND')
  })

  it('[HU36-FE] al remover al usuario emite access:revoked y bloquea el acceso', async () => {
    const svc = asUser('user2')
    const listener = vi.fn()
    svc.subscribe(listener)
    svc.removeMember('conv-1', 'user2')
    expect(listener).toHaveBeenCalledWith({ type: 'access:revoked', data: { projectId: 'proj-neurobloom' } })
    expect(await codeOf(svc.messages('conv-1'))).toBe('403 NOT_MEMBER')
  })

  it('rechaza mensajes vacíos y chats de proyectos cerrados', async () => {
    const conversations = seedConversations()
    conversations[0].status = 'cerrado'
    const svc = new MockChatService({ conversations, currentUserId: () => 'user1' })
    expect(await codeOf(svc.send('conv-2', { text: '   ' }))).toBe('400 EMPTY_MESSAGE')
    expect(await codeOf(svc.send('conv-1', { text: 'hola' }))).toBe('409 PROJECT_CLOSED')
  })

  it('[HU37-FE] acepta PDF y rechaza otros formatos con 400 INVALID_FILE', async () => {
    const svc = asUser('user1')
    const msg = await svc.send('conv-1', { file: file('plan.pdf', 'application/pdf', 2_516_582) })
    expect(msg.attachments[0]).toMatchObject({ name: 'plan.pdf', mimeType: 'application/pdf', size: 2_516_582 })
    expect(await codeOf(svc.send('conv-1', { file: file('nota.docx', 'application/msword', 100) }))).toBe('400 INVALID_FILE')
  })
})

describe('[HU37-FE] validateAttachment', () => {
  it('permite PDF y PNG de hasta 10 MB', () => {
    expect(validateAttachment(file('a.pdf', 'application/pdf', 10 * 1024 * 1024))).toBeNull()
    expect(validateAttachment(file('a.png', 'image/png', 1024))).toBeNull()
  })

  it('rechaza otros formatos o archivos de más de 10 MB', () => {
    expect(validateAttachment(file('a.jpg', 'image/jpeg', 1024))).toBe(INVALID_ATTACHMENT_MESSAGE)
    expect(validateAttachment(file('a.pdf', 'application/pdf', 10 * 1024 * 1024 + 1))).toBe(INVALID_ATTACHMENT_MESSAGE)
    expect(INVALID_ATTACHMENT_MESSAGE).toBe('Formato no permitido o el archivo supera el límite de 10MB')
  })

  it('formatea tamaños como en el diseño', () => {
    expect(formatBytes(2_516_582)).toBe('2.4 MB')
    expect(formatBytes(2048)).toBe('2 KB')
  })
})
