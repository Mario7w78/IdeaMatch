import { afterEach, describe, expect, it, vi } from 'vitest'
import { RealtimeClient, realtime, realtimeUrl, type RealtimeMessage } from '../http/realtime'
import { httpChatService } from './httpChatService'

afterEach(() => vi.unstubAllGlobals())

function stubFetch(status: number, json?: unknown) {
  const fn = vi.fn(async (_url: string, _init: RequestInit) =>
    new Response(json === undefined ? null : JSON.stringify(json), { status }),
  )
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('[HU35-FE] httpChatService', () => {
  it('pide los mensajes con los cursores before/after', async () => {
    const fetch = stubFetch(200, [])
    await httpChatService.messages('7', { after: '41', limit: 100 })
    expect(fetch.mock.calls[0][0]).toBe('/api/conversations/7/messages?after=41&limit=100')
  })

  it('envía texto como JSON', async () => {
    const fetch = stubFetch(201, { message: { id: '1' } })
    const msg = await httpChatService.send('7', { text: ' hola ' })
    expect(msg).toEqual({ id: '1' })
    const init = fetch.mock.calls[0][1]
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ text: 'hola' }))
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('[HU37-FE] envía el adjunto como multipart sin forzar Content-Type', async () => {
    const fetch = stubFetch(201, { message: { id: '2' } })
    const file = new File(['%PDF-'], 'brief.pdf', { type: 'application/pdf' })
    await httpChatService.send('7', { text: 'Te paso el brief', file })
    const init = fetch.mock.calls[0][1]
    expect(init.body).toBeInstanceOf(FormData)
    const form = init.body as FormData
    expect((form.get('file') as File).name).toBe('brief.pdf')
    expect(form.get('text')).toBe('Te paso el brief')
    expect((init.headers as Record<string, string>)['Content-Type']).toBeUndefined()
  })
})

/** WebSocket falso controlado por la prueba. */
class FakeSocket {
  static all: FakeSocket[] = []
  onopen: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  readonly url: string
  closed = false
  constructor(url: string) {
    this.url = url
    FakeSocket.all.push(this)
  }
  close() {
    if (this.closed) return
    this.closed = true
    this.onclose?.()
  }
  open() {
    this.onopen?.()
  }
  push(type: string, data: unknown) {
    this.onmessage?.({ data: JSON.stringify({ type, data }) })
  }
}

describe('[HU35-FE] RealtimeClient', () => {
  it('arma la URL ws(s) con el token', () => {
    expect(realtimeUrl('a b', 'https://api.test')).toBe('wss://api.test/ws?token=a%20b')
    expect(realtimeUrl('t', 'http://localhost:3000')).toBe('ws://localhost:3000/ws?token=t')
  })

  it('informa el estado, reenvía eventos y se reconecta al caerse', async () => {
    vi.useFakeTimers()
    FakeSocket.all = []
    const client = new RealtimeClient(() => 'ws://x/ws?token=t', (u) => new FakeSocket(u) as unknown as WebSocket)
    const statuses: string[] = []
    const events: string[] = []
    const offStatus = client.onStatus((s) => statuses.push(s))
    const offEvents = client.subscribe((m) => events.push(m.type))

    FakeSocket.all[0].open()
    FakeSocket.all[0].push('message:new', { conversationId: '1' })
    FakeSocket.all[0].close()
    expect(statuses).toEqual(['offline', 'connecting', 'online', 'offline'])
    expect(events).toEqual(['message:new'])

    await vi.advanceTimersByTimeAsync(1000)
    expect(FakeSocket.all).toHaveLength(2)
    FakeSocket.all[1].open()
    expect(statuses.at(-1)).toBe('online')

    offStatus()
    offEvents()
    expect(FakeSocket.all[1].closed).toBe(true)
    vi.useRealTimers()
  })

  it('[HU36-FE] el chat convierte la notificación member_removed en access:revoked', () => {
    let push: (m: RealtimeMessage) => void = () => {}
    vi.spyOn(realtime, 'subscribe').mockImplementation((l) => {
      push = l
      return () => {}
    })
    const seen: unknown[] = []
    httpChatService.subscribe((e) => seen.push(e))
    push({ type: 'notification:new', data: { notification: { type: 'new_application', payload: { projectId: '9' } } } })
    push({ type: 'notification:new', data: { notification: { type: 'member_removed', payload: { projectId: 9 } } } })
    push({ type: 'message:read', data: { conversationId: '1', userId: '2', readAt: 'x' } })
    expect(seen).toEqual([
      { type: 'access:revoked', data: { projectId: '9' } },
      { type: 'message:read', data: { conversationId: '1', userId: '2', readAt: 'x' } },
    ])
    vi.restoreAllMocks()
  })
})
