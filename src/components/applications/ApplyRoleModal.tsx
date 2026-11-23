import { useEffect, useState } from 'react'
import {
  applicationService,
  type ApplicationProject,
  type ApplicationRole,
} from '../../services/applications'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface ApplyRoleModalProps {
  open: boolean
  onClose: () => void
  userId: string
  initialProjectId?: string
  initialRoleId?: string
  onApplied?: () => void
}

export function ApplyRoleModal({
  open,
  onClose,
  userId,
  initialProjectId,
  initialRoleId,
  onApplied,
}: ApplyRoleModalProps) {
  const [projects, setProjects] = useState<ApplicationProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let active = true
    async function loadData() {
      const list = await applicationService.getAvailableProjects()
      if (!active) return
      setProjects(list)
      const defaultProj = initialProjectId || list[0]?.id || ''
      setSelectedProjectId(defaultProj)
      const proj = list.find((p) => p.id === defaultProj)
      setSelectedRoleId(initialRoleId || proj?.roles[0]?.id || '')
      setNote('')
      setError(null)

      if (defaultProj && userId) {
        const applied = await applicationService.hasAppliedToProject(userId, defaultProj)
        if (!active) return
        setAlreadyApplied(applied)
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [open, initialProjectId, initialRoleId, userId])

  const currentProject = projects.find((p) => p.id === selectedProjectId)
  const currentRole = currentProject?.roles.find((r) => r.id === selectedRoleId) as
    | ApplicationRole
    | undefined

  async function handleProjectChange(newProjId: string) {
    setSelectedProjectId(newProjId)
    const p = projects.find((proj) => proj.id === newProjId)
    setSelectedRoleId(p?.roles[0]?.id || '')
    if (newProjId && userId) {
      const applied = await applicationService.hasAppliedToProject(userId, newProjId)
      setAlreadyApplied(applied)
    }
  }

  const hasNoVacancies = currentRole !== undefined && currentRole.vacancies <= 0
  const isSubmitDisabled =
    loading || alreadyApplied || hasNoVacancies || note.trim().length < 5

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProjectId || !selectedRoleId) return
    setError(null)
    setLoading(true)

    try {
      await applicationService.applyToRole(userId, {
        projectId: selectedProjectId,
        roleId: selectedRoleId,
        note,
      })
      onApplied?.()
      onClose()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error al enviar la postulación.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enviar postulación a un rol"
      description="Selecciona el proyecto y el rol al que deseas postular, adjuntando tu nota de presentación."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert tone="danger">{error}</Alert>}

        {/* HU22 Alterno: Bloqueo si ya tiene postulación */}
        {alreadyApplied && (
          <Alert tone="warning">
            Ya cuentas con una postulación registrada para este proyecto.
          </Alert>
        )}

        {/* HU21 Alterno: Bloqueo si no hay vacantes */}
        {hasNoVacancies && (
          <Alert tone="danger">
            El rol seleccionado ya ha cubierto todas sus vacantes.
          </Alert>
        )}

        {/* Selector de Proyecto */}
        <div>
          <label htmlFor="select-project" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
            Proyecto
          </label>
          <select
            id="select-project"
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.title} ({proj.category})
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Rol */}
        {currentProject && (
          <div>
            <label htmlFor="select-role" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Rol vacante
            </label>
            <select
              id="select-role"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {currentProject.roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roleName} ({r.vacancies} {r.vacancies === 1 ? 'vacante' : 'vacantes'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Habilidades requeridas del rol */}
        {currentRole && currentRole.skills.length > 0 && (
          <div>
            <span className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Habilidades requeridas
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentRole.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-ink border border-line/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nota de presentación (HU21) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="application-note" className="text-xs font-semibold text-ink uppercase tracking-wider">
              Nota de presentación
            </label>
            <span className="text-xs text-muted">{note.length} / 500</span>
          </div>
          <textarea
            id="application-note"
            rows={4}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Hola, me entusiasma este proyecto porque cuento con experiencia en..."
            className="w-full rounded-xl border border-line bg-white p-3.5 text-sm text-ink placeholder:text-muted focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <p className="mt-1 text-xs text-muted">
            Describe brevemente tu experiencia y por qué te interesa sumarte a esta iniciativa.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-3 border-t border-line">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={isSubmitDisabled}
          >
            Postular
          </Button>
        </div>
      </form>
    </Modal>
  )
}
