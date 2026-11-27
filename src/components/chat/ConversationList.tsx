import { MessageSquare, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ConversationSummary } from '../../services/chat'
import { firstName, formatListTime } from './chatFormat'
import { ProjectAvatar } from './ProjectAvatar'

interface Props {
  conversations: ConversationSummary[]
  activeId?: string
  loading: boolean
  error: string
  /** Nombre completo del usuario actual, para mostrar «Tú:» en la vista previa. */
  myName: string
}

/** [HU35-FE] Columna izquierda: buscador y conversaciones (una por proyecto). */
export function ConversationList({ conversations, activeId, loading, error, myName }: Props) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return term ? conversations.filter((c) => c.project.name.toLowerCase().includes(term)) : conversations
  }, [conversations, q])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-[26px] leading-tight font-bold">Mensajes</h1>
        <label className="mt-4 flex h-11 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 focus-within:border-brand-300">
          <Search size={18} className="shrink-0 text-ink" aria-hidden="true" />
          <span className="sr-only">Buscar conversación</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar conversación"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-subtle"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {loading && <p role="status" className="px-2 py-4 text-sm text-muted">Cargando conversaciones…</p>}
        {!loading && error && <p role="alert" className="px-2 py-4 text-sm text-danger-600">{error}</p>}
        {!loading && !error && conversations.length === 0 && (
          <div className="mt-6 flex flex-col items-center px-4 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <MessageSquare size={22} aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-semibold">Aún no tienes conversaciones</p>
            <p className="mt-1 text-xs text-muted">
              Cuando publiques un proyecto o te acepten en uno, su chat aparecerá aquí.
            </p>
          </div>
        )}
        {!loading && !error && conversations.length > 0 && filtered.length === 0 && (
          <p className="px-2 py-4 text-sm text-muted">No hay conversaciones que coincidan con «{q.trim()}».</p>
        )}

        <ul className="space-y-1" aria-label="Conversaciones">
          {filtered.map((c) => {
            const active = c.id === activeId
            const last = c.lastMessage
            const author = last ? (last.authorName === myName ? 'Tú' : firstName(last.authorName)) : ''
            return (
              <li key={c.id}>
                <Link
                  to={`/app/mensajes/${c.id}`}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-2.5 py-3 transition-colors ${
                    active ? 'bg-brand-50' : 'hover:bg-surface'
                  }`}
                >
                  <ProjectAvatar project={c.project} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{c.project.name}</span>
                      {last && <span className="shrink-0 text-[11px] text-muted">{formatListTime(last.sentAt)}</span>}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className={`min-w-0 flex-1 truncate text-xs ${c.unreadCount ? 'font-semibold text-ink' : 'text-muted'}`}>
                        {last ? `${author}: ${last.text}` : 'Sin mensajes todavía'}
                      </span>
                      {c.unreadCount > 0 && (
                        <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
                          {c.unreadCount > 99 ? '99+' : c.unreadCount}
                          <span className="sr-only"> mensajes sin leer</span>
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
