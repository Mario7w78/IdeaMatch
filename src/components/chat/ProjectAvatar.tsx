import type { ChatProjectRef } from '../../services/chat'
import { projectAvatarLabel, projectTint } from './chatFormat'

export function ProjectAvatar({ project, variant = 'list' }: { project: ChatProjectRef; variant?: 'list' | 'header' }) {
  const tint = projectTint(project.coverColor)
  return (
    <span
      aria-hidden="true"
      style={tint}
      className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${tint ? '' : 'bg-brand-100 text-brand-700'}`}
    >
      {projectAvatarLabel(project, variant)}
    </span>
  )
}
