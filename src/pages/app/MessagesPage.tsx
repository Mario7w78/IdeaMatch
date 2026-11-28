import { MessageSquare } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChatRoom } from '../../components/chat/ChatRoom'
import { ConversationList } from '../../components/chat/ConversationList'
import { useAuth } from '../../context/useAuth'
import { notifyChatRead } from '../../hooks/useUnreadMessages'
import { chatService, type ChatMessage, type ConversationSummary } from '../../services/chat'

export const REVOKED_NOTICE = 'Ya no formas parte de este equipo'

/** [HU35-FE] [HU36-FE] [HU37-FE] Mensajes: lista de chats a la izquierda y la sala a la derecha. */
export function MessagesPage() {
  const { conversationId } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const user = session?.user
  const userId = user?.id ?? ''
  const myName = user ? `${user.firstName} ${user.lastName}`.trim() : ''

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(() => {
    return chatService
      .list()
      .then((items) => {
        setConversations(items)
        setError('')
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudieron cargar las conversaciones.'))
  }, [])

  useEffect(() => {
    let active = true
    chatService
      .list()
      .then((items) => { if (active) setConversations(items) })
      .catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : 'No se pudieron cargar las conversaciones.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  // En escritorio se abre la conversación más reciente, como en el diseño.
  useEffect(() => {
    if (conversationId || loading || !conversations.length) return
    if (window.matchMedia?.('(min-width: 1024px)').matches) {
      navigate(`/app/mensajes/${conversations[0].id}`, { replace: true })
    }
  }, [conversationId, loading, conversations, navigate])

  const applyMessage = useCallback(
    (convId: string, message: ChatMessage) => {
      setConversations((list) => {
        const current = list.find((c) => String(c.id) === String(convId))
        if (!current) {
          void reload()
          return list
        }
        const fromOther = message.author.id !== userId && String(convId) !== String(conversationId)
        const updated: ConversationSummary = {
          ...current,
          lastMessage: {
            text: message.text || (message.attachments.length ? 'Archivo adjunto' : ''),
            authorName: message.author.name,
            sentAt: message.sentAt,
          },
          unreadCount: fromOther ? current.unreadCount + 1 : current.unreadCount,
        }
        return [updated, ...list.filter((c) => c !== current)]
      })
    },
    [userId, conversationId, reload],
  )

  // Vista previa y contadores en vivo para las demás conversaciones.
  useEffect(
    () =>
      chatService.subscribe((e) => {
        if (e.type === 'message:new') applyMessage(String(e.data.conversationId), e.data.message)
        else if (e.type === 'access:revoked') void reload()
      }),
    [applyMessage, reload],
  )

  const markRead = useCallback((convId: string) => {
    setConversations((list) => list.map((c) => (String(c.id) === String(convId) ? { ...c, unreadCount: 0 } : c)))
    notifyChatRead()
  }, [])

  const revoked = useCallback(() => {
    navigate('/app', { replace: true, state: { notice: REVOKED_NOTICE } })
  }, [navigate])

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100dvh-64px)] bg-white sm:-mx-8 lg:-mx-10 lg:-my-10 lg:h-[calc(100dvh-72px)]">
      <aside
        className={`h-full w-full shrink-0 border-r border-line lg:block lg:w-[268px] ${conversationId ? 'hidden' : 'block'}`}
      >
        <ConversationList
          conversations={conversations}
          activeId={conversationId}
          loading={loading}
          error={error}
          myName={myName}
        />
      </aside>
      <div className={`h-full min-w-0 flex-1 ${conversationId ? 'block' : 'hidden lg:block'}`}>
        {conversationId && userId ? (
          <ChatRoom
            key={conversationId}
            conversationId={conversationId}
            userId={userId}
            onMessage={applyMessage}
            onRead={markRead}
            onRevoked={revoked}
          />
        ) : (
          <div className="grid h-full place-items-center bg-surface px-6 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-card">
                <MessageSquare size={24} aria-hidden="true" />
              </span>
              <p className="mt-4 font-semibold">Selecciona una conversación</p>
              <p className="mt-1 text-sm text-muted">Cada proyecto en el que participas tiene su propio chat privado.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
