import { useId, useState } from 'react'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import {
  PROJECT_STATUS_LABELS,
  ProjectsError,
  SELECTABLE_STATUSES,
  projectsService,
  type Project,
  type ProjectStatus,
} from '../../services/projects'

const CONSEQUENCE: Partial<Record<ProjectStatus, string>> = {
  OPEN: 'Volverás a recibir nuevas postulaciones.',
  IN_PROGRESS: 'Dejarás de recibir nuevas postulaciones mientras el proyecto está en ejecución.',
  PAUSED: 'Dejarás de recibir nuevas postulaciones. Podrás reanudar el proyecto cuando quieras.',
  CLOSED: 'Dejarás de recibir postulaciones y el proyecto se marcará como concluido.',
}

interface Props {
  project: Project
  ownerId: string
  onChanged: (project: Project) => void
}

/** HU14: el creador cambia el estado de su proyecto, con confirmación. */
export function ProjectStatusSelector({ project, ownerId, onChanged }: Props) {
  const id = useId()
  const [target, setTarget] = useState<ProjectStatus>(project.status)
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  async function confirm() {
    setSaving(true)
    try {
      const updated = await projectsService.changeStatus(project.id, ownerId, target)
      onChanged(updated)
      setFeedback({ tone: 'success', text: `Estado actualizado a «${PROJECT_STATUS_LABELS[target]}».` })
    } catch (e) {
      setTarget(project.status)
      setFeedback({
        tone: 'error',
        text: e instanceof ProjectsError ? e.message : 'No se pudo cambiar el estado. Inténtalo de nuevo.',
      })
    } finally {
      setSaving(false)
      setConfirming(false)
    }
  }

  // Un proyecto cancelado no aparece entre las opciones: lo gestiona HU15.
  const options = SELECTABLE_STATUSES

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        Estado del proyecto
      </label>
      <select
        id={id}
        value={target}
        onChange={(e) => {
          setTarget(e.target.value as ProjectStatus)
          setFeedback(null)
        }}
        className="mt-2 h-11 w-full rounded-xl border border-line bg-field px-3 text-[15px] text-ink focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 focus:outline-none"
      >
        {options.map((s) => (
          <option key={s} value={s}>
            {PROJECT_STATUS_LABELS[s]}
          </option>
        ))}
        {!options.includes(project.status) && (
          <option value={project.status}>{PROJECT_STATUS_LABELS[project.status]}</option>
        )}
      </select>
      <Button
        className="mt-3 w-full"
        variant="secondary"
        disabled={target === project.status}
        onClick={() => setConfirming(true)}
      >
        Cambiar estado
      </Button>
      {feedback && (
        <div className="mt-3">
          <Alert tone={feedback.tone}>{feedback.text}</Alert>
        </div>
      )}

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Cambiar estado del proyecto"
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={confirm} loading={saving}>
              Confirmar cambio
            </Button>
          </div>
        }
      >
        <p className="text-[15px]">
          El proyecto pasará de <strong>{PROJECT_STATUS_LABELS[project.status]}</strong> a{' '}
          <strong>{PROJECT_STATUS_LABELS[target]}</strong>. {CONSEQUENCE[target]}
        </p>
      </Modal>
    </div>
  )
}
