import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { chatService, type ChatService } from '../services/chat'

/** Se lanza cuando el usuario lee una conversación, para que el contador baje al instante. */
const CHAT_READ_EVENT = 'im:chat-read'

export function notifyChatRead() {
  window.dispatchEvent(new Event(CHAT_READ_EVENT))
}

/**
 * [HU35-FE] Total de mensajes sin leer en todas las conversaciones del usuario
 * (número junto a «Mensajes» en la barra lateral). Se actualiza con los eventos del chat.
 */
export function useUnreadMessages(service: ChatService = chatService): number {
  const { session } = useAuth()
  const userId = session?.user.id ?? null
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!userId) return
    let alive = true
    let request = 0
    let queued = false
    // Varios eventos juntos (mensaje nuevo + leído) se resuelven con una sola consulta.
    const load = () => {
      if (queued) return
      queued = true
      queueMicrotask(fetchCount)
    }
    const fetchCount = () => {
      queued = false
      if (!alive) return
      const mine = ++request
      service.list().then(
        (list) => {
          // Solo vale la última respuesta (puede haber varias en vuelo).
          if (alive && mine === request) setCount(list.reduce((sum, c) => sum + (c.unreadCount || 0), 0))
        },
        () => {
          /* sin conexión: se conserva el último número */
        },
      )
    }

    load()
    const offEvents = service.subscribe((e) => {
      if (e.type === 'message:new' || e.type === 'message:read' || e.type === 'access:revoked') load()
    })
    // Al reconectarse, se recalcula con lo que llegó mientras tanto.
    let wasOnline = false
    let dropped = false
    const offStatus = service.onStatus((s) => {
      if (s === 'online') {
        if (dropped) load()
        wasOnline = true
        dropped = false
      } else if (wasOnline) {
        dropped = true
      }
    })
    window.addEventListener(CHAT_READ_EVENT, load)
    return () => {
      alive = false
      offEvents()
      offStatus()
      window.removeEventListener(CHAT_READ_EVENT, load)
    }
  }, [userId, service])

  return count
}
