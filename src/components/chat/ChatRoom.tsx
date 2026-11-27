import { ArrowLeft, FileText, Plus, SendHorizontal, X } from 'lucide-react'
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../services/http/apiClient'
import {
  ATTACHMENT_ACCEPT,
  CHAT_ERRORS,
  INVALID_ATTACHMENT_MESSAGE,
  READ_ONLY_STATUSES,
  chatService,
  formatBytes,
  validateAttachment,
  type ChatAttachment,
  type ChatMessage,
  type ConnectionStatus,
  type ConversationDetail,
} from '../../services/chat'
import { Alert } from '../ui/Alert'
import { buttonClasses } from '../ui/buttonClasses'
import { dayLabel, formatTime, statusLabel } from './chatFormat'
import { ProjectAvatar } from './ProjectAvatar'

const PAGE_SIZE = 30
const POLL_MS = 5_000
const READ_ONLY_MESSAGE = 'El proyecto está cerrado: el chat es de solo lectura.'

interface Props {
  conversationId: string
  userId: string
  /** Se envió o llegó un mensaje (para actualizar la vista previa de la lista). */
  onMessage: (conversationId: string, message: ChatMessage) => void
  /** La conversación quedó leída (contador en 0). */
  onRead: (conversationId: string) => void
  /** [HU36] El usuario ya no pertenece al equipo. */
  onRevoked: () => void
}

const isNotMember = (e: unknown) => e instanceof ApiError && (e.status === 403 || e.code === CHAT_ERRORS.NOT_MEMBER)
const errorText = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback)

const STATUS_TEXT: Record<ConnectionStatus, string> = {
  online: 'Conectado',
  connecting: 'Conectando…',
  offline: 'Sin conexión, reintentando…',
}
const STATUS_DOT: Record<ConnectionStatus, string> = {
  online: 'bg-success-600',
  connecting: 'bg-warning-500',
  offline: 'bg-subtle',
}

/** [HU35-FE] [HU36-FE] [HU37-FE] Sala de chat: cabecera, historial con scroll y redactor con adjuntos. */
export function ChatRoom({ conversationId: id, userId, onMessage, onRead, onRevoked }: Props) {
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [readOnly, setReadOnly] = useState(false)

  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [sendError, setSendError] = useState('')
  const [sending, setSending] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const scrollMode = useRef<'bottom' | 'preserve' | 'none'>('none')
  const prevHeight = useRef(0)
  const messagesRef = useRef<ChatMessage[]>([])
  // Callbacks del padre en un ref: los efectos no se reinician cuando cambian.
  const cb = useRef({ onMessage, onRead, onRevoked })
  useLayoutEffect(() => {
    messagesRef.current = messages
    cb.current = { onMessage, onRead, onRevoked }
  })

  const markRead = useCallback(() => {
    chatService.markRead(id).then(() => cb.current.onRead(id)).catch((e: unknown) => {
      if (isNotMember(e)) cb.current.onRevoked()
    })
  }, [id])

  const nearBottom = () => {
    const el = listRef.current
    return !el || el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  const append = useCallback((incoming: ChatMessage[]) => {
    if (!incoming.length) return
    if (nearBottom()) scrollMode.current = 'bottom'
    setMessages((ms) => {
      const known = new Set(ms.map((m) => String(m.id)))
      const fresh = incoming.filter((m) => !known.has(String(m.id)))
      return fresh.length ? [...ms, ...fresh] : ms
    })
  }, [])

  /** Trae lo que llegó mientras no había conexión. */
  const sync = useCallback(() => {
    const last = messagesRef.current[messagesRef.current.length - 1]
    if (!last) return
    chatService
      .messages(id, { after: last.id, limit: 100 })
      .then((ms) => {
        append(ms)
        if (ms.some((m) => m.author.id !== userId)) markRead()
      })
      .catch((e: unknown) => {
        if (isNotMember(e)) cb.current.onRevoked()
      })
  }, [id, userId, append, markRead])

  // Carga inicial
  useEffect(() => {
    let active = true
    Promise.all([chatService.get(id), chatService.messages(id, { limit: PAGE_SIZE })])
      .then(([d, ms]) => {
        if (!active) return
        setDetail(d)
        setMessages(ms)
        setHasMore(ms.length === PAGE_SIZE)
        setReadOnly(READ_ONLY_STATUSES.includes(d.projectStatus))
        scrollMode.current = 'bottom'
        markRead()
      })
      .catch((e: unknown) => {
        if (!active) return
        if (isNotMember(e)) cb.current.onRevoked()
        else setLoadError(errorText(e, 'No se pudo cargar la conversación.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, markRead])

  // Eventos en vivo
  const projectId = detail?.project.id
  useEffect(
    () =>
      chatService.subscribe((e) => {
        if (e.type === 'message:new' && String(e.data.conversationId) === id) {
          append([e.data.message])
          if (e.data.message.author.id !== userId) markRead()
        } else if (e.type === 'message:read' && String(e.data.conversationId) === id && String(e.data.userId) !== userId) {
          const readAt = e.data.readAt
          setMessages((ms) =>
            ms.map((m) => (m.author.id === userId && !m.readByOthers && m.sentAt <= readAt ? { ...m, readByOthers: true } : m)),
          )
        } else if (e.type === 'access:revoked' && projectId && String(e.data.projectId) === String(projectId)) {
          cb.current.onRevoked()
        }
      }),
    [id, userId, projectId, append, markRead],
  )

  // Estado de conexión; al reconectarse se sincroniza lo pendiente
  useEffect(() => {
    let everOnline = false
    let lost = false
    return chatService.onStatus((s) => {
      setStatus(s)
      if (s === 'online') {
        if (lost) sync()
        everOnline = true
        lost = false
      } else if (s === 'offline' && everOnline) {
        lost = true
      }
    })
  }, [sync])

  // Respaldo sin WebSocket: consulta cada 5 s
  useEffect(() => {
    if (status !== 'offline' || loading || loadError) return
    const timer = setInterval(sync, POLL_MS)
    return () => clearInterval(timer)
  }, [status, loading, loadError, sync])

  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    if (scrollMode.current === 'bottom') el.scrollTop = el.scrollHeight
    else if (scrollMode.current === 'preserve') el.scrollTop = el.scrollHeight - prevHeight.current
    scrollMode.current = 'none'
  }, [messages])

  async function loadOlder() {
    const first = messages[0]
    if (!first || loadingOlder) return
    setLoadingOlder(true)
    try {
      const older = await chatService.messages(id, { before: first.id, limit: PAGE_SIZE })
      prevHeight.current = listRef.current?.scrollHeight ?? 0
      scrollMode.current = 'preserve'
      setMessages((ms) => [...older.filter((o) => !ms.some((m) => m.id === o.id)), ...ms])
      setHasMore(older.length === PAGE_SIZE)
    } catch (e) {
      if (isNotMember(e)) cb.current.onRevoked()
      else setSendError(errorText(e, 'No se pudieron cargar los mensajes anteriores.'))
    } finally {
      setLoadingOlder(false)
    }
  }

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return
    const problem = validateAttachment(picked)
    setFileError(problem ?? '')
    setFile(problem ? null : picked)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const clean = text.trim()
    if (sending || readOnly || (!clean && !file)) return
    setSending(true)
    setSendError('')
    try {
      const msg = await chatService.send(id, { text: clean || undefined, file: file ?? undefined })
      scrollMode.current = 'bottom'
      append([msg])
      cb.current.onMessage(id, msg)
      setText('')
      setFile(null)
      setFileError('')
    } catch (err) {
      if (isNotMember(err)) return cb.current.onRevoked()
      const code = err instanceof ApiError ? err.code : ''
      if (code === CHAT_ERRORS.PROJECT_CLOSED) setReadOnly(true)
      else if (code === CHAT_ERRORS.INVALID_FILE) setFileError(INVALID_ATTACHMENT_MESSAGE)
      else setSendError(errorText(err, 'No se pudo enviar el mensaje. Inténtalo de nuevo.'))
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <p role="status" className="grid h-full place-items-center bg-surface text-sm text-muted">Cargando conversación…</p>
  }
  if (loadError || !detail) {
    return (
      <div className="p-6">
        <BackLink />
        <div className="mt-4"><Alert tone="error">{loadError || 'No se pudo cargar la conversación.'}</Alert></div>
      </div>
    )
  }

  const canSend = !sending && (text.trim() !== '' || file !== null)

  return (
    <section className="flex h-full min-h-0 flex-col" aria-label={`Chat de ${detail.project.name}`}>
      <header className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 sm:px-6">
        <BackLink />
        <ProjectAvatar project={detail.project} variant="header" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[17px] leading-tight font-bold">{detail.project.name}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
            <span className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[status]}`} aria-hidden="true" />
            <span role="status" className={status === 'online' ? 'sr-only' : ''}>{STATUS_TEXT[status]}</span>
            {status !== 'online' && <span aria-hidden="true">·</span>}
            <span className="truncate">
              {detail.membersCount} {detail.membersCount === 1 ? 'integrante' : 'integrantes'} · {statusLabel(detail.projectStatus)}
            </span>
          </p>
        </div>
        <Link to={`/app/proyecto/${detail.project.id}`} className={buttonClasses('secondary', 'md', 'shrink-0 px-4!')}>
          Ver proyecto
        </Link>
      </header>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label={`Mensajes de ${detail.project.name}`}
        className="min-h-0 flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8"
      >
        {hasMore && (
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={loadOlder}
              disabled={loadingOlder}
              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60"
            >
              {loadingOlder ? 'Cargando…' : 'Cargar mensajes anteriores'}
            </button>
          </div>
        )}
        {messages.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted">Aún no hay mensajes. ¡Escribe el primero al equipo!</p>
        )}
        <ol className="space-y-5">
          {messages.map((m, i) => {
            const day = dayLabel(m.sentAt)
            const showDay = i === 0 || dayLabel(messages[i - 1].sentAt) !== day
            return (
              <Fragment key={m.id}>
                {showDay && (
                  <li className="py-1 text-center text-[11px] font-medium tracking-wide text-muted uppercase">{day}</li>
                )}
                <li>{m.author.id === userId ? <OwnMessage message={m} /> : <OtherMessage message={m} />}</li>
              </Fragment>
            )
          })}
        </ol>
      </div>

      <form onSubmit={submit} className="border-t border-line bg-white px-4 py-3.5 sm:px-6">
        {readOnly ? (
          <p className="rounded-xl bg-surface px-4 py-3 text-center text-sm text-muted">{READ_ONLY_MESSAGE}</p>
        ) : (
          <>
            {(fileError || sendError) && (
              <div className="mb-3 space-y-2">
                {fileError && <Alert tone="error">{fileError}</Alert>}
                {sendError && <Alert tone="error">{sendError}</Alert>}
              </div>
            )}
            {file && (
              <div className="mb-3 flex items-center gap-3 rounded-xl border border-line bg-field px-3 py-2">
                <FileText size={18} className="shrink-0 text-brand-600" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                <span className="shrink-0 text-xs text-muted">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="rounded-lg p-1 text-muted hover:bg-surface hover:text-ink"
                  aria-label={`Quitar ${file.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface text-ink hover:bg-brand-50 hover:text-brand-700"
                aria-label="Adjuntar archivo (PDF o PNG, máx. 10 MB)"
                title="Adjuntar archivo (PDF o PNG, máx. 10 MB)"
              >
                <Plus size={20} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept={ATTACHMENT_ACCEPT}
                onChange={pickFile}
                className="sr-only"
                tabIndex={-1}
                aria-label="Archivo adjunto"
              />
              <label className="min-w-0 flex-1">
                <span className="sr-only">Escribe un mensaje</span>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={2000}
                  placeholder="Escribe un mensaje..."
                  className="h-11 w-full rounded-xl bg-field px-4 text-[15px] outline-none placeholder:text-subtle focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <button
                type="submit"
                disabled={!canSend}
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:bg-surface disabled:text-subtle"
                aria-label="Enviar mensaje"
              >
                <SendHorizontal size={19} />
              </button>
            </div>
          </>
        )}
      </form>
    </section>
  )
}

function BackLink() {
  return (
    <Link
      to="/app/mensajes"
      className="-ml-1 rounded-lg p-1.5 text-ink hover:bg-surface lg:hidden"
      aria-label="Volver a las conversaciones"
    >
      <ArrowLeft size={20} />
    </Link>
  )
}

function OtherMessage({ message: m }: { message: ChatMessage }) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-xs font-bold text-brand-700"
      >
        {m.author.initials}
      </span>
      <div className="max-w-[min(520px,85%)] rounded-2xl border border-line bg-white px-4 py-3.5 shadow-card">
        <p className="flex items-baseline gap-2.5 text-[13px]">
          <span className="font-bold">{m.author.name}</span>
          <time dateTime={m.sentAt} className="text-muted">{formatTime(m.sentAt)}</time>
        </p>
        {m.text && <p className="mt-2 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-muted">{m.text}</p>}
        {m.attachments.map((a) => <AttachmentLink key={a.id} attachment={a} />)}
      </div>
    </div>
  )
}

function OwnMessage({ message: m }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[min(520px,85%)] rounded-2xl bg-brand-600 px-4 py-3.5 text-white">
        {m.text && <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{m.text}</p>}
        {m.attachments.map((a) => <AttachmentLink key={a.id} attachment={a} own />)}
        <p className="mt-3 text-[13px] text-white/85">
          <time dateTime={m.sentAt}>{formatTime(m.sentAt)}</time> · {m.readByOthers ? 'Visto' : 'Enviado'}
        </p>
      </div>
    </div>
  )
}

function AttachmentLink({ attachment: a, own = false }: { attachment: ChatAttachment; own?: boolean }) {
  const isImage = a.mimeType === 'image/png'
  return (
    <a
      href={a.url}
      download={a.name}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Descargar ${a.name} (${formatBytes(a.size)})`}
      className={`mt-3 block rounded-xl px-3 py-2.5 transition-colors ${own ? 'bg-white/15 hover:bg-white/25' : 'bg-surface hover:bg-brand-50'}`}
    >
      {isImage && a.url !== '#' && (
        <img src={a.url} alt="" className="mb-2 max-h-48 w-full rounded-lg object-cover" loading="lazy" />
      )}
      <span className="flex items-center justify-between gap-6">
        <span className={`min-w-0 truncate text-[13px] ${own ? 'text-white underline-offset-2 hover:underline' : 'text-brand-700 hover:underline'}`}>
          {a.name}
        </span>
        <span className={`shrink-0 text-[11px] ${own ? 'text-white/80' : 'text-muted'}`}>{formatBytes(a.size)}</span>
      </span>
    </a>
  )
}
