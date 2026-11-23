import { Flag } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import {
  REPORT_CAUSE_LABELS,
  ReportsError,
  reportsService,
  type ReportCause,
} from '../../services/reports'
import { useAuth } from '../../context/useAuth'

interface ReportModalProps {
  open: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
  creatorId?: string
  creatorName?: string
  creatorEmail?: string
  onSubmitted?: () => void
}

export function ReportModal({
  open,
  onClose,
  projectId,
  projectTitle,
  creatorId = 'usr-demo',
  creatorName = 'Creador de la publicación',
  creatorEmail = 'creador@ideamatch.com',
  onSubmitted,
}: ReportModalProps) {
  const { session } = useAuth()
  const [cause, setCause] = useState<ReportCause>('spam')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmed = reason.trim()
    if (!trimmed) {
      setError('Proporcione un motivo')
      return
    }

    setBusy(true)
    try {
      const user = session?.user
      await reportsService.createReport({
        projectId,
        projectTitle,
        creatorId,
        creatorName,
        creatorEmail,
        reporterId: user?.id ?? 'user1',
        reporterName: user ? `${user.firstName} ${user.lastName}` : 'Usuario de la comunidad',
        cause,
        reason: trimmed,
      })

      setSuccess(true)
      onSubmitted?.()
      setTimeout(() => {
        setSuccess(false)
        setReason('')
        setCause('spam')
        onClose()
      }, 1200)
    } catch (err) {
      if (err instanceof ReportsError || err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error al enviar el reporte.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reportar publicación"
      description="HU39 · Reporte de publicaciones e ideas inapropiadas"
      maxWidth="md"
    >
      {success ? (
        <div className="py-6 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-success-50 text-success-600">
            <Flag size={24} />
          </div>
          <h3 className="mt-3 text-lg font-bold text-ink">¡Reporte enviado!</h3>
          <p className="mt-1 text-sm text-muted">
            El equipo de moderación revisará la publicación «{projectTitle}».
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-line bg-surface p-3 text-xs text-muted">
            <p>
              Publicación reportada: <strong className="text-ink font-semibold">{projectTitle}</strong>
            </p>
            <p className="mt-0.5 text-subtle">Creador: {creatorName}</p>
          </div>

          {error && (
            <Alert tone="error">
              <span className="font-semibold">{error}</span>
            </Alert>
          )}

          <div>
            <label htmlFor="report-cause" className="mb-2 block text-sm font-semibold text-ink">
              Causa del reporte
            </label>
            <select
              id="report-cause"
              value={cause}
              onChange={(e) => setCause(e.target.value as ReportCause)}
              className="w-full rounded-xl border border-line bg-field px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            >
              {Object.entries(REPORT_CAUSE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="report-reason" className="text-sm font-semibold text-ink">
                Motivo detallado <span className="text-danger-600">*</span>
              </label>
              <span className="text-xs text-subtle">{reason.length}/500</span>
            </div>
            <textarea
              id="report-reason"
              rows={4}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explica qué norma o aspecto incumple esta publicación…"
              className={`w-full rounded-xl border bg-field p-3.5 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 ${
                error ? 'border-danger-600 bg-danger-50/20' : 'border-line'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" loading={busy} iconLeft={<Flag size={16} />}>
              Enviar reporte
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
