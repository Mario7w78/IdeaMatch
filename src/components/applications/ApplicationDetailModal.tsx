import type { Application } from '../../services/applications'
import { ApplicationBadge } from './ApplicationBadge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface ApplicationDetailModalProps {
  application: Application | null
  open: boolean
  onClose: () => void
  onCancelClick?: (app: Application) => void
}

export function ApplicationDetailModal({
  application,
  open,
  onClose,
  onCancelClick,
}: ApplicationDetailModalProps) {
  if (!application) return null

  const isPending = application.status === 'PENDING'
  const dateFormatted = new Date(application.createdAt).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={application.projectTitle}
      description={`Postulación para el rol de ${application.roleName}`}
      maxWidth="md"
      footer={
        <div className="flex justify-between items-center w-full">
          {isPending ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose()
                onCancelClick?.(application)
              }}
              className="text-danger-600 hover:text-danger-700 hover:border-danger-300"
            >
              Cancelar postulación
            </Button>
          ) : (
            <div />
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <div className="text-xs text-muted uppercase tracking-wider font-semibold">Categoría</div>
            <div className="text-sm font-medium text-ink">{application.projectCategory}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Estado</div>
            <ApplicationBadge status={application.status} />
          </div>
        </div>

        <div>
          <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Fecha de envío</div>
          <div className="text-sm text-ink">{dateFormatted}</div>
        </div>

        <div>
          <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-1.5">
            Nota de presentación enviada
          </div>
          <div className="rounded-xl border border-line bg-surface/40 p-4 text-sm text-ink italic leading-relaxed">
            "{application.note}"
          </div>
        </div>
      </div>
    </Modal>
  )
}
