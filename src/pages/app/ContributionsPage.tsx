import { ExternalLink, GitMerge, LoaderCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Badge, type BadgeTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/useAuth'
import {
  contributionsService,
  ContributionsError,
  EXTERNAL_TOOL_LABELS,
  type Contribution,
  type ContributionStatus,
} from '../../services/contributions'

type Filter = ContributionStatus | 'all'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'validated', label: 'Validadas' },
  { id: 'rejected', label: 'Rechazadas' },
  { id: 'unassociated', label: 'No asociadas' },
  { id: 'all', label: 'Todas' },
]

const STATUS_BADGE: Record<ContributionStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Pendiente de validación', tone: 'warning' },
  validated: { label: 'Validada', tone: 'success' },
  rejected: { label: 'Rechazada', tone: 'danger' },
  unassociated: { label: 'No asociada', tone: 'neutral' },
}

const EMPTY_TEXT: Record<Filter, string> = {
  pending: 'No tienes contribuciones pendientes de validación.',
  validated: 'Todavía no has validado contribuciones.',
  rejected: 'No has rechazado contribuciones.',
  unassociated: 'No hay contribuciones sin asociar.',
  all: 'Aún no hay contribuciones registradas en tus proyectos.',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })

/** HU43: el creador revisa y valida las contribuciones externas de su equipo. */
export function ContributionsPage() {
  const { session } = useAuth()
  const creatorId = session?.user.id ?? ''
  const [filter, setFilter] = useState<Filter>('pending')
  const [items, setItems] = useState<Contribution[] | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const load = useCallback(async () => {
    const [list, pending] = await Promise.all([
      contributionsService.listForCreator(creatorId, filter === 'all' ? undefined : filter),
      contributionsService.listForCreator(creatorId, 'pending'),
    ])
    return { list, pending: pending.length }
  }, [creatorId, filter])

  useEffect(() => {
    let active = true
    load().then(({ list, pending }) => {
      if (!active) return
      setItems(list)
      setPendingCount(pending)
    })
    return () => {
      active = false
    }
  }, [load])

  async function review(c: Contribution, action: 'validate' | 'reject') {
    setBusyId(c.id)
    try {
      if (action === 'validate') await contributionsService.validate(c.id, creatorId)
      else await contributionsService.reject(c.id, creatorId)
      setFeedback({
        tone: 'success',
        text:
          action === 'validate'
            ? `Contribución validada. Ahora aparece en el perfil de ${c.collaboratorName}.`
            : 'Contribución rechazada.',
      })
    } catch (e) {
      setFeedback({
        tone: 'error',
        text: e instanceof ContributionsError ? e.message : 'No se pudo completar la acción. Inténtalo de nuevo.',
      })
    } finally {
      setBusyId(null)
      const { list, pending } = await load()
      setItems(list)
      setPendingCount(pending)
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.15em] text-brand-700 uppercase">Mis proyectos</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Contribuciones</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Lo que tu equipo hace en GitHub, Figma y Trello llega aquí. Valida las contribuciones para que cuenten en el
        perfil de cada colaborador.
      </p>

      <div role="group" aria-label="Filtrar contribuciones" className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => {
              setFilter(f.id)
              setFeedback(null)
            }}
            className={`h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
              filter === f.id
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line bg-white text-muted hover:border-brand-300 hover:text-ink'
            }`}
          >
            {f.label}
            {f.id === 'pending' && ` (${pendingCount})`}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="mt-6">
          <Alert tone={feedback.tone}>{feedback.text}</Alert>
        </div>
      )}

      {!items ? (
        <div role="status" className="grid place-items-center py-20 text-muted">
          <LoaderCircle className="animate-spin" aria-label="Cargando contribuciones" />
        </div>
      ) : items.length === 0 ? (
        <section className="mt-8 flex flex-col items-center rounded-3xl border border-line bg-white px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-brand-100 text-brand-700">
            <GitMerge size={28} aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-bold">{EMPTY_TEXT[filter]}</h2>
          <p className="mt-2 max-w-sm text-muted">
            Vincula el repositorio, el diseño o el tablero de tu proyecto para recibir su actividad.
          </p>
        </section>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((c) => {
            const badge = STATUS_BADGE[c.status]
            return (
              <li key={c.id} className="rounded-2xl border border-line bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="brand">{EXTERNAL_TOOL_LABELS[c.tool]}</Badge>
                      <span className="text-sm text-muted">{c.projectTitle}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-bold">
                      {c.url ? (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-brand-700 hover:underline"
                        >
                          {c.summary}
                          <ExternalLink size={15} aria-hidden="true" />
                        </a>
                      ) : (
                        c.summary
                      )}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {c.collaboratorName ? (
                        <>
                          Por <span className="font-medium text-ink">{c.collaboratorName}</span>
                        </>
                      ) : (
                        <>
                          Sin cuenta asociada ·{' '}
                          <span className="font-medium text-ink">{c.actorEmail}</span>
                        </>
                      )}{' '}
                      · {formatDate(c.receivedAt)}
                    </p>
                  </div>
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                </div>
                {c.status === 'pending' && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      onClick={() => review(c, 'validate')}
                      loading={busyId === c.id}
                      disabled={busyId !== null}
                      aria-label={`Validar contribución: ${c.summary}`}
                    >
                      Validar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => review(c, 'reject')}
                      disabled={busyId !== null}
                      aria-label={`Rechazar contribución: ${c.summary}`}
                    >
                      Rechazar
                    </Button>
                  </div>
                )}
                {c.status === 'unassociated' && (
                  <p className="mt-4 text-sm text-muted">
                    Ninguna cuenta de IdeaMatch usa este correo, así que no se puede validar ni afecta a otros usuarios.
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
