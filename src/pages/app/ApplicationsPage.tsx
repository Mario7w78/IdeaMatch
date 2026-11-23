import { LoaderCircle, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ApplicationDetailModal } from '../../components/applications/ApplicationDetailModal'
import { ApplicationsEmptyState } from '../../components/applications/ApplicationsEmptyState'
import { ApplicationStatsCards } from '../../components/applications/ApplicationStatsCards'
import { ApplicationsTable } from '../../components/applications/ApplicationsTable'
import { ApplyRoleModal } from '../../components/applications/ApplyRoleModal'
import { CancelApplicationModal } from '../../components/applications/CancelApplicationModal'
import { Alert } from '../../components/ui/Alert'
import { Button, ButtonLink } from '../../components/ui/Button'
import { useAuth } from '../../context/useAuth'
import {
  applicationService,
  type Application,
  type ApplicationStats,
} from '../../services/applications'

export function ApplicationsPage() {
  const { session } = useAuth()
  const userId = session?.user.id || 'usr-mariana'

  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    finalized: 0,
  })

  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [appToCancel, setAppToCancel] = useState<Application | null>(null)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    tone: 'success' | 'danger'
    text: string
  } | null>(null)

  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    let active = true
    async function fetchData() {
      const [list, s] = await Promise.all([
        applicationService.getMyApplications(userId),
        applicationService.getApplicationStats(userId),
      ])
      if (!active) return
      setApplications(list)
      setStats(s)
      setLoading(false)
    }
    fetchData()
    return () => {
      active = false
    }
  }, [userId, reloadTrigger])

  useEffect(() => {
    if (!feedbackMessage) return
    const timer = setTimeout(() => setFeedbackMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [feedbackMessage])

  async function handleConfirmCancel(app: Application) {
    await applicationService.cancelApplication(userId, app.id)
    setFeedbackMessage({
      tone: 'success',
      text: `Tu postulación a "${app.projectTitle}" ha sido cancelada exitosamente.`,
    })
    setReloadTrigger((v) => v + 1)
  }

  function handleApplicationSuccess() {
    setFeedbackMessage({
      tone: 'success',
      text: '¡Postulación enviada con éxito! El creador del proyecto ha sido notificado.',
    })
    setReloadTrigger((v) => v + 1)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoaderCircle size={32} className="animate-spin text-brand-600" />
      </div>
    )
  }

  const isEmpty = applications.length === 0

  return (
    <div className="space-y-6">
      {/* Mensaje de feedback temporal */}
      {feedbackMessage && (
        <Alert tone={feedbackMessage.tone}>{feedbackMessage.text}</Alert>
      )}

      {/* Encabezado de página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider uppercase text-brand-600">
            Seguimiento
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Mis postulaciones
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isEmpty
              ? 'Aquí podrás consultar el estado de las oportunidades a las que te postules.'
              : 'Consulta el estado y los próximos pasos de cada oportunidad.'}
          </p>
        </div>

        {/* Acciones del encabezado */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            iconLeft={<Plus size={16} />}
            onClick={() => setIsApplyModalOpen(true)}
          >
            Nueva postulación
          </Button>
          {!isEmpty && (
            <ButtonLink to="/app/explorar" variant="primary" size="md">
              Explorar más proyectos
            </ButtonLink>
          )}
        </div>
      </div>

      {/* Contenido principal: Estado Vacío vs. Estadísticas y Tabla */}
      {isEmpty ? (
        <ApplicationsEmptyState />
      ) : (
        <div className="space-y-6">
          <ApplicationStatsCards stats={stats} />
          <ApplicationsTable
            applications={applications}
            onViewDetail={(app) => setSelectedApp(app)}
            onCancelApplication={(app) => setAppToCancel(app)}
          />
        </div>
      )}

      {/* Modal de Detalle */}
      <ApplicationDetailModal
        open={Boolean(selectedApp)}
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onCancelClick={(app) => setAppToCancel(app)}
      />

      {/* Modal de Cancelación (HU23) */}
      <CancelApplicationModal
        open={Boolean(appToCancel)}
        application={appToCancel}
        onClose={() => setAppToCancel(null)}
        onConfirmCancel={handleConfirmCancel}
      />

      {/* Modal de Nueva Postulación (HU21 y HU22) */}
      <ApplyRoleModal
        open={isApplyModalOpen}
        userId={userId}
        onClose={() => setIsApplyModalOpen(false)}
        onApplied={handleApplicationSuccess}
      />
    </div>
  )
}
