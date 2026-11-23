import { Badge } from '../ui/Badge'
import { ButtonLink } from '../ui/Button'
import { openVacancies, teamSize, type Project } from '../../services/projects'
import { coverFor } from './projectCover'
import { TeamAvatars } from './TeamAvatars'

export function ProjectCard({ project }: { project: Project }) {
  const skills = [...new Set(project.roles.flatMap((r) => r.skills))].slice(0, 4)
  const vacancies = openVacancies(project)
  const people = [project.creatorName, ...project.members.map((m) => m.name)]

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-xs transition-shadow hover:shadow-md">
      <div className={`flex h-28 items-start bg-gradient-to-br p-4 ${coverFor(project.category)}`}>
        <Badge tone="brand">{project.category}</Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold">{project.title}</h2>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{project.summary}</p>
        {skills.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Habilidades buscadas">
            {skills.map((s) => (
              <li key={s} className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft">
                {s}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
          <div className="flex items-center gap-3">
            <TeamAvatars names={people} />
            <span className="text-xs text-muted">
              {teamSize(project)} {teamSize(project) === 1 ? 'integrante' : 'integrantes'} ·{' '}
              {vacancies} {vacancies === 1 ? 'vacante' : 'vacantes'}
            </span>
          </div>
        </div>
        <ButtonLink
          to={`/app/proyecto/${project.id}`}
          variant="secondary"
          size="sm"
          className="mt-4 w-full"
        >
          Ver proyecto
          <span className="sr-only"> {project.title}</span>
        </ButtonLink>
      </div>
    </article>
  )
}
