import { Badge, type BadgeTone } from '../ui/Badge'
import { PROJECT_STATUS_LABELS, type ProjectStatus } from '../../services/projects'

const TONES: Record<ProjectStatus, BadgeTone> = {
  OPEN: 'success',
  IN_PROGRESS: 'brand',
  PAUSED: 'warning',
  CLOSED: 'neutral',
  CANCELLED: 'danger',
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={TONES[status]}>{PROJECT_STATUS_LABELS[status]}</Badge>
}
