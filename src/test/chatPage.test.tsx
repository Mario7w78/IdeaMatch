import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { chatService, MockChatService, seedConversations } from '../services/chat'
import { ApiError } from '../services/http/apiClient'
import { renderAt, testAuth } from './helpers'

async function openAs(email: string, path: string) {
  const auth = testAuth()
  await auth.login(email, 'Password123')
  renderAt(path, auth)
}

/** Permite simular que otro integrante escribe. */
let actingAs: string | null = null
const sessionUser = () => (JSON.parse(localStorage.getItem('im.session') ?? '{}') as { userId?: string }).userId ?? null

/** Cada prueba trabaja sobre datos semilla nuevos (el servicio real es un singleton). */
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

const pdf = (name: string, size: number) => {
  const f = new File(['%PDF-'], name, { type: 'application/pdf' })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

afterEach(() => vi.restoreAllMocks())

describe('HU35-FE · Sala de chat del proyecto', () => {
  it('muestra la lista de proyectos y la conversación con su historial', async () => {
    freshMock()
    await openAs('user1@ideamatch.com', '/app/mensajes/conv-1')

    const list = await screen.findByRole('list', { name: 'Conversaciones' })
    expect(await within(list).findByText('NeuroBloom')).toBeInTheDocument()
    expect(within(list).getByText('Verde Cerca')).toBeInTheDocument()
    expect(within(list).getByText('Orbit Finance')).toBeInTheDocument()

    const log = await screen.findByRole('log', { name: 'Mensajes de NeuroBloom' })
    expect(within(log).getByText(/Subí la primera versión del brief/)).toBeInTheDocument()
    expect(within(log).getByRole('link', { name: 'Descargar Brief_producto_v1.pdf (2.4 MB)' })).toBeInTheDocument()
    expect(within(log).getByText(/Visto/)).toBeInTheDocument()
    expect(screen.getByText('5 integrantes · En curso')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver proyecto' })).toHaveAttribute('href', '/app/proyecto/proj-neurobloom')
  })

  it('envía un mensaje y lo muestra como propio', async () => {
    freshMock()
    await openAs('user1@ideamatch.com', '/app/mensajes/conv-1')
    const input = await screen.findByRole('textbox', { name: 'Escribe un mensaje' })
    const send = screen.getByRole('button', { name: 'Enviar mensaje' })
    expect(send).toBeDisabled()
    fireEvent.change(input, { target: { value: 'Nos vemos a las 4' } })
    fireEvent.click(send)
    expect(await screen.findByText('Nos vemos a las 4')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('recibe en vivo los mensajes de otros integrantes', async () => {
    const mock = freshMock()
    await openAs('user2@ideamatch.com', '/app/mensajes/conv-1')
    await screen.findByRole('log', { name: 'Mensajes de NeuroBloom' })
    await act(async () => {
      actingAs = 'user1'
      await mock.send('conv-1', { text: 'Mensaje en vivo' })
      actingAs = null
    })
    expect(await screen.findByText('Mensaje en vivo')).toBeInTheDocument()
  })

  it('en un proyecto cerrado el chat es de solo lectura', async () => {
    freshMock((c) => { c[0].status = 'cerrado' })
    await openAs('user1@ideamatch.com', '/app/mensajes/conv-1')
    expect(await screen.findByText('El proyecto está cerrado: el chat es de solo lectura.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Escribe un mensaje' })).not.toBeInTheDocument()
  })

  it('muestra el estado vacío cuando no hay conversaciones', async () => {
    vi.spyOn(chatService, 'list').mockResolvedValue([])
    await openAs('user1@ideamatch.com', '/app/mensajes')
    expect(await screen.findByText('Aún no tienes conversaciones')).toBeInTheDocument()
  })
})

describe('HU36-FE · Bloqueo de acceso para no integrantes', () => {
  it('quien no integra el equipo vuelve al inicio con el aviso', async () => {
    freshMock()
    await openAs('user1@ideamatch.com', '/app/mensajes/conv-4')
    expect(await screen.findByText('Ya no formas parte de este equipo')).toBeInTheDocument()
    expect(screen.queryByRole('log')).not.toBeInTheDocument()
  })

  it('si lo remueven mientras chatea, se le redirige al inicio', async () => {
    const mock = freshMock()
    await openAs('user2@ideamatch.com', '/app/mensajes/conv-1')
    await screen.findByRole('log', { name: 'Mensajes de NeuroBloom' })
    act(() => mock.removeMember('conv-1', 'user2'))
    expect(await screen.findByText('Ya no formas parte de este equipo')).toBeInTheDocument()
  })

  it('un 403 al enviar también redirige', async () => {
    freshMock()
    await openAs('user1@ideamatch.com', '/app/mensajes/conv-1')
    vi.spyOn(chatService, 'send').mockRejectedValue(new ApiError(403, 'NOT_MEMBER', 'Solo el creador…'))
    fireEvent.change(await screen.findByRole('textbox', { name: 'Escribe un mensaje' }), { target: { value: 'hola' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(await screen.findByText('Ya no formas parte de este equipo')).toBeInTheDocument()
  })
})

describe('HU37-FE · Adjuntar y descargar archivos', () => {
  it('adjunta un PDF y lo deja disponible para descargar', async () => {
    freshMock()
    await openAs('user1@ideamatch.com', '/app/mensajes/conv-1')
    const fileInput = await screen.findByLabelText('Archivo adjunto')
    fireEvent.change(fileInput, { target: { files: [pdf('Roadmap.pdf', 1_258_291)] } })
    expect(screen.getByText('Roadmap.pdf')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(await screen.findByRole('link', { name: 'Descargar Roadmap.pdf (1.2 MB)' })).toBeInTheDocument()
  })

  it('rechaza formatos no permitidos o archivos de más de 10 MB sin enviarlos', async () => {
    freshMock()
    await openAs('user1@ideamatch.com', '/app/mensajes/conv-1')
    const fileInput = await screen.findByLabelText('Archivo adjunto')
    const docx = new File(['x'], 'notas.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    fireEvent.change(fileInput, { target: { files: [docx] } })
    expect(screen.getByText('Formato no permitido o el archivo supera el límite de 10MB')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled()

    fireEvent.change(fileInput, { target: { files: [pdf('grande.pdf', 11 * 1024 * 1024)] } })
    expect(screen.getByText('Formato no permitido o el archivo supera el límite de 10MB')).toBeInTheDocument()
    expect(screen.queryByText('grande.pdf')).not.toBeInTheDocument()
    await waitFor(() => expect(chatService.send).not.toHaveBeenCalled())
  })
})
