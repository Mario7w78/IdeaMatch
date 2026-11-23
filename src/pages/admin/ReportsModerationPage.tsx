import { LoaderCircle, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Badge, type BadgeTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { useAuth } from '../../context/useAuth'
import {
  REPORT_CAUSE_LABELS,
  ReportsError,
  reportsService,
  type Report,
  type ReportStatus,
} from '../../services/reports'

type Filter = ReportStatus | 'all'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'resolved', label: 'Resueltos' },
  { id: 'dismissed', label: 'Descartados' },
  { id: 'all', label: 'Todos' },
]

const STATUS_BADGE: Record<ReportStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Pendiente', tone: 'warning' },
  resolved: { label: 'Proyecto suspendido', tone: 'danger' },
  dismissed: { label: 'Descartado', tone: 'neutral' },
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })

/** HU40: panel central para revisar reportes y suspender proyectos (solo administradores). */
export function ReportsModerationPage() {
  const { session } = useAuth()
  const adminId = session?.user.id ?? ''
  const [filter, setFilter] = useState<Filter>('pending')
  const [reports, setReports] = useState<Report[] | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [target, setTarget] = useState<Report | null>(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const load = useCallback(async () => {
    const [list, pending] = await Promise.all([
      reportsService.listReports(filter === 'all' ? undefined : filter),
      reportsService.listReports('pending'),
    ])
    return { list, pending: pending.length }
  }, [filter])

  useEffect(() => {
    let active = true
    load().then(({ list, pending }) => {
      if (!active) return
      setReports(list)
      setPendingCount(pending)
    })
    return () => {
      active = false
    }
  }, [load])

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true)
    try {
      await action()
      setFeedback({ tone: 'success', text: success })
    } catch (e) {
      setFeedback({
        tone: 'error',
        text: e instanceof ReportsError ? e.message : 'No se pudo completar la acción. Inténtalo de nuevo.',
      })
    } finally {
      setBusy(false)
      setTarget(null)
      const { list, pending } = await load()
      setReports(list)
      setPendingCount(pending)
    }
  }

  const confirmSuspend = () =>
    target &&
    run(
      () => reportsService.suspendProject(target.id, adminId),
      `Proyecto «${target.projectTitle}» suspendido. Se notificó a ${target.creatorName}.`,
    )

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.15em] text-brand-700 uppercase">Administración</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Moderación de reportes</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Revisa los reportes de la comunidad. Al suspender un proyecto, se oculta del público y se avisa a su creador.
      </p>

      <div role="group" aria-label="Filtrar reportes" className="mt-8 flex flex-wrap gap-2">
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

      {!reports ? (
        <div role="status" className="grid place-items-center py-20 text-muted">
          <LoaderCircle className="animate-spin" aria-label="Cargando reportes" />
        </div>
      ) : reports.length === 0 ? (
        <section className="mt-8 flex flex-col items-center rounded-3xl border border-line bg-white px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-brand-100 text-brand-700">
            <ShieldCheck size={28} aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-bold">
            {filter === 'pending' ? 'No hay reportes pendientes' : 'No hay reportes en esta lista'}
          </h2>
          <p className="mt-2 max-w-sm text-muted">Cuando alguien reporte un proyecto, aparecerá aquí para su revisión.</p>
        </section>
      ) : (
        <ul className="mt-8 space-y-4">
          {reports.map((r) => (
            <li key={r.id} className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold">{r.projectTitle}</h2>
                  <p className="mt-1 text-sm text-muted">
                    Creador: <span className="font-medium text-ink">{r.creatorName}</span> · Reportado por{' '}
                    <span className="font-medium text-ink">{r.reporterName}</span> · {formatDate(r.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="brand">{REPORT_CAUSE_LABELS[r.cause]}</Badge>
                  <Badge tone={STATUS_BADGE[r.status].tone}>{STATUS_BADGE[r.status].label}</Badge>
                </div>
              </div>
              <p className="mt-4 rounded-xl bg-surface px-4 py-3 text-[15px]">{r.reason}</p>
              {r.status === 'pending' && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    className="border-danger-600/40 text-danger-600 hover:border-danger-600 hover:bg-danger-50"
                    onClick={() => setTarget(r)}
                    disabled={busy}
                    aria-label={`Suspender proyecto ${r.projectTitle}`}
                  >
                    Suspender proyecto
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={() =>
                      run(() => reportsService.dismissReport(r.id, adminId), 'Reporte descartado. El proyecto sigue visible.')
                    }
                    aria-label={`Descartar reporte de ${r.projectTitle}`}
                  >
                    Descartar reporte
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title="Suspender proyecto"
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setTarget(null)} disabled={busy}>
              Cancelar
            </Button>
            <Button onClick={confirmSuspend} loading={busy}>
              Confirmar suspensión
            </Button>
          </div>
        }
      >
        <p className="text-[15px]">
          El proyecto <strong>«{target?.projectTitle}»</strong> se ocultará del público y se avisará a{' '}
          {target?.creatorName}. ¿Quieres continuar?
        </p>
      </Modal>
    </div>
  )
}
