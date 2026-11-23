import { useState } from 'react'
import type { Application } from '../../services/applications'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface CancelApplicationModalProps {
  application: Application | null
  open: boolean
  onClose: () => void
  onConfirmCancel: (application: Application) => Promise<void>
}

export function CancelApplicationModal({
  application,
  open,
  onClose,
  onConfirmCancel,
}: CancelApplicationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!application) return null

  // Validación HU23: si ya fue procesada, alertar
  const isProcessable = application.status === 'PENDING'

  async function handleConfirm() {
    if (!application) return
    setError(null)
    setLoading(true)
    try {
      await onConfirmCancel(application)
      onClose()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error al cancelar la postulación.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancelar postulación"
      description="Esta acción retirará tu candidatura del proceso de selección."
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Mantener postulación
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={loading}
            disabled={!isProcessable}
            className="bg-danger-600 hover:bg-danger-700 shadow-none"
          >
            Confirmar cancelación
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}

        {!isProcessable && (
          <Alert tone="warning">
            No se puede cancelar una postulación que ya ha sido procesada por el creador.
          </Alert>
        )}

        <div className="rounded-xl border border-line bg-surface/50 p-4">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider">
            Proyecto
          </div>
          <div className="text-base font-bold text-ink">{application.projectTitle}</div>
          <div className="mt-2 text-xs font-semibold text-muted uppercase tracking-wider">
            Rol al que postulaste
          </div>
          <div className="text-sm font-medium text-ink">{application.roleName}</div>
        </div>

        <p className="text-sm text-muted">
          Al confirmar, el registro pasará al estado{' '}
          <strong className="text-ink">Cancelada por Colaborador</strong>. Si luego deseas volver a
          postular, deberás hacerlo nuevamente desde el catálogo de proyectos.
        </p>
      </div>
    </Modal>
  )
}
