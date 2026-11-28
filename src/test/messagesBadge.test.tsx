import { act, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { chatService, MockChatService, seedConversations } from '../services/chat'
import { renderAt, testAuth } from './helpers'

let actingAs: string | null = null
const sessionUser = () => (JSON.parse(localStorage.getItem('im.session') ?? '{}') as { userId?: string }).userId ?? null

function freshMock(mutate?: (c: ReturnType<typeof seedConversations>) => void) {
  const conversations = seedConversations()
  mutate?.(conversations)
  const mock = new MockChatService({ conversations, currentUserId: () => actingAs ?? sessionUser() })
  for (const key of ['list', 'get', 'messages', 'send', 'markRead', 'subscribe', 'onStatus'] as const) {
    vi.spyOn(chatService, key).mockImplementation(((...args: never[]) =>
      (mock[key] as (...a: never[]) => unknown).apply(mock, args)) as never)
  }
  return mock
}

async function openAs(email: string, path = '/app') {
  const auth = testAuth()
  await auth.login(email, 'Password123')
  renderAt(path, auth)
}

const messagesLink = () =>
  within(screen.getByRole('navigation', { name: 'Principal' })).getByRole('link', { name: /^Mensajes/ })

afterEach(() => {
  actingAs = null
  vi.restoreAllMocks()
})

describe('HU35-FE · Número de mensajes sin leer en «Mensajes»', () => {
  it('muestra el total sin leer en un círculo morado con el número en blanco', async () => {
    freshMock()
    await openAs('user1@ideamatch.com')

    // Semilla de user1: 2 en NeuroBloom + 1 en Verde Cerca + 1 en Orbit Finance.
    const badge = await screen.findByTestId('messages-unread-badge')
    expect(badge).toHaveTextContent('4')
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain('bg-brand-600')
    expect(badge.className).toContain('text-white')
    expect(messagesLink()).toHaveAccessibleName('Mensajes, 4 sin leer')
  })

  it('si no hay mensajes pendientes no muestra el número', async () => {
    const future = new Date(Date.now() + 60_000).toISOString()
    freshMock((cs) => cs.forEach((c) => (c.reads.user1 = future)))
    await openAs('user1@ideamatch.com')

    await waitFor(() => expect(chatService.list).toHaveBeenCalled())
    expect(screen.queryByTestId('messages-unread-badge')).not.toBeInTheDocument()
    expect(messagesLink()).toHaveAccessibleName('Mensajes')
  })

  it('baja al abrir una conversación y sube cuando llega un mensaje de otro integrante', async () => {
    const mock = freshMock()
    await openAs('user1@ideamatch.com', '/app/mensajes/conv-1')

    // Al abrir NeuroBloom se leen sus 2 mensajes: quedan 2.
    await waitFor(() => expect(screen.getByTestId('messages-unread-badge')).toHaveTextContent('2'))

    // Llega un mensaje de user2 a Verde Cerca (otra conversación).
    act(() => {
      actingAs = 'user2'
      void mock.send('conv-2', { text: 'Hola, ¿revisas el diseño?' })
      actingAs = null
    })

    await waitFor(() => expect(screen.getByTestId('messages-unread-badge')).toHaveTextContent('3'))
  })
})
