import { API_URL, tokenStore } from './apiClient'

/**
 * [HU35-FE] Cliente del WebSocket del backend (`/ws?token=<jwt>`).
 * Una sola conexión compartida por el chat y las notificaciones: se abre con el
 * primer suscriptor, se reconecta con espera creciente y se cierra con el último.
 * El servidor envía `{ type, data }`: `ready`, `message:new`, `message:read`, `notification:new`.
 */

export type RealtimeStatus = 'connecting' | 'online' | 'offline'
export interface RealtimeMessage {
  type: string
  data: unknown
}

type EventListener = (msg: RealtimeMessage) => void
type StatusListener = (status: RealtimeStatus) => void

const MAX_BACKOFF_MS = 15_000

/** `https://api` → `wss://api/ws?token=…` */
export function realtimeUrl(token: string, base: string = API_URL): string {
  return `${base.replace(/^http/, 'ws')}/ws?token=${encodeURIComponent(token)}`
}

export class RealtimeClient {
  private socket: WebSocket | null = null
  private status: RealtimeStatus = 'offline'
  private readonly events = new Set<EventListener>()
  private readonly statuses = new Set<StatusListener>()
  private retries = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private readonly url: () => string | null
  private readonly createSocket: (url: string) => WebSocket

  constructor(
    url: () => string | null = () => {
      const token = tokenStore.get()
      return token ? realtimeUrl(token) : null
    },
    createSocket: (url: string) => WebSocket = (u) => new WebSocket(u),
  ) {
    this.url = url
    this.createSocket = createSocket
  }

  subscribe(listener: EventListener): () => void {
    this.events.add(listener)
    this.ensureConnected()
    return () => {
      this.events.delete(listener)
      this.maybeDisconnect()
    }
  }

  onStatus(listener: StatusListener): () => void {
    this.statuses.add(listener)
    listener(this.status)
    this.ensureConnected()
    return () => {
      this.statuses.delete(listener)
      this.maybeDisconnect()
    }
  }

  private setStatus(next: RealtimeStatus) {
    if (next === this.status) return
    this.status = next
    for (const l of this.statuses) l(next)
  }

  private ensureConnected() {
    if (this.socket || this.retryTimer) return
    const url = this.url()
    if (!url || typeof WebSocket === 'undefined') {
      this.setStatus('offline')
      return
    }
    this.setStatus('connecting')
    const ws = this.createSocket(url)
    this.socket = ws
    ws.onopen = () => {
      this.retries = 0
      this.setStatus('online')
    }
    ws.onmessage = (e: MessageEvent) => {
      let msg: RealtimeMessage
      try {
        msg = JSON.parse(String(e.data)) as RealtimeMessage
      } catch {
        return
      }
      if (!msg || typeof msg.type !== 'string') return
      for (const l of this.events) l(msg)
    }
    ws.onclose = () => {
      if (this.socket !== ws) return
      this.socket = null
      this.setStatus('offline')
      this.scheduleReconnect()
    }
    ws.onerror = () => ws.close()
  }

  private scheduleReconnect() {
    if (!this.hasListeners()) return
    const delay = Math.min(1000 * 2 ** this.retries, MAX_BACKOFF_MS)
    this.retries += 1
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      this.ensureConnected()
    }, delay)
  }

  private hasListeners() {
    return this.events.size > 0 || this.statuses.size > 0
  }

  private maybeDisconnect() {
    if (this.hasListeners()) return
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = null
    const ws = this.socket
    this.socket = null
    ws?.close()
    this.retries = 0
    this.status = 'offline'
  }
}

export const realtime = new RealtimeClient()
