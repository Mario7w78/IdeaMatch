import { Check, Code2, LoaderCircle, SearchX, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApplyRoleModal } from '../../components/applications/ApplyRoleModal'
import { coverFor } from '../../components/projects/projectCover'
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge'
import { ProjectStatusSelector } from '../../components/projects/ProjectStatusSelector'
import { TeamAvatars } from '../../components/projects/TeamAvatars'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { Button, ButtonLink } from '../../components/ui/Button'
import { useAuth } from '../../context/useAuth'
import { initialsOf, timeAgo } from '../../lib/format'
import { applicationService } from '../../services/applications'
import { profileService } from '../../services/profile'
import { openVacancies, projectsService, teamSize, type Project } from '../../services/projects'

/** HU17: página completa de un proyecto. Para el creador, incluye el cambio de estado (HU14). */
export function ProjectDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''

  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [applied, setApplied] = useState(false)
  const [creatorHasProfile, setCreatorHasProfile] = useState(false)
  const [applyRoleId, setApplyRoleId] = useState<string | null>(null)
  const [justApplied, setJustApplied] = useState(false)

  const load = useCallback(async () => {
    const p = await projectsService.getProject(id)
    const [hasApplied, profile] = p
      ? await Promise.all([
          applicationService.hasAppliedToProject(userId, p.id),
          p.creatorId ? profileService.getPublicProfile(p.creatorId) : Promise.resolve(null),
        ])
      : [false, null]
    return { p, hasApplied, hasProfile: profile !== null }
  }, [id, userId])

  useEffect(() => {
    let active = true
    load().then(({ p, hasApplied, hasProfile }) => {
      if (!active) return
      setProject(p)
      setApplied(hasApplied)
      setCreatorHasProfile(hasProfile)
    })
    return () => {
      active = false
    }
  }, [load])

  if (project === undefined) {
    return (
      <div role="status" className="grid place-items-center py-24 text-muted">
        <LoaderCircle className="animate-spin" aria-label="Cargando proyecto" />
      </div>
    )
  }

  if (project === null) {
    return (
      <section className="flex flex-col items-center rounded-3xl border border-line bg-white px-6 py-20 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <SearchX size={28} aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-brand-700 uppercase">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold">El proyecto no existe o fue eliminado</h1>
        <p className="mt-3 max-w-md text-muted">Revisa el enlace o busca otro proyecto en el catálogo.</p>
        <ButtonLink to="/app/explorar" variant="secondary" className="mt-8">
          Volver a Explorar
        </ButtonLink>
      </section>
    )
  }

  const isCreator = project.creatorId === userId
  const isOpen = project.status === 'OPEN'
  const vacancies = openVacancies(project)
  const firstFree = project.roles.find((r) => r.vacancies > 0)
  const team = [project.creatorName, ...project.members.map((m) => m.name)]

  function roleAction(roleId: string, vacanciesLeft: number, roleName: string) {
    if (isCreator) return null
    if (applied) return <Button size="sm" disabled>Ya postulaste</Button>
    if (!isOpen) return <Button size="sm" disabled>No recibe postulaciones</Button>
    if (vacanciesLeft <= 0) return <Button size="sm" disabled>Sin vacantes</Button>
    return (
      <Button size="sm" onClick={() => setApplyRoleId(roleId)} aria-label={`Postular a ${roleName}`}>
        Postular
      </Button>
    )
  }

  return (
    <div>
      <nav aria-label="Ruta de navegación" className="text-sm text-muted">
        <Link to="/app/explorar" className="hover:text-ink hover:underline">
          Explorar
        </Link>
        <span className="mx-2">/</span>
        <span>{project.category}</span>
        <span className="mx-2">/</span>
        <span className="text-ink">{project.title}</span>
      </nav>

      {justApplied && (
        <div className="mt-5">
          <Alert tone="success">¡Postulación enviada! El creador del proyecto ya puede revisarla.</Alert>
        </div>
      )}

      <section className={`mt-5 overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-10 sm:px-10 ${coverFor(project.category)}`}>
        <div className="flex flex-wrap items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <span className="text-sm text-ink-soft">Publicado {timeAgo(project.createdAt)}</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{project.title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">{project.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Etiquetas">
          {project.tags.map((t) => (
            <li key={t} className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-ink-soft">
              {t}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-line bg-white p-6 sm:p-8">
            <h2 className="text-xl font-bold">La idea</h2>
            <p className="mt-3 leading-relaxed text-muted">{project.description}</p>
            {project.goals.length > 0 && (
              <>
                <h3 className="mt-6 text-lg font-bold">Lo que queremos construir</h3>
                <ol className="mt-3 grid gap-3 sm:grid-cols-3">
                  {project.goals.map((g, i) => (
                    <li key={g} className="rounded-2xl bg-surface p-4">
                      <span className="text-lg font-bold text-brand-600">{String(i + 1).padStart(2, '0')}</span>
                      <p className="mt-1 text-sm text-ink-soft">{g}</p>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>

          <section className="rounded-3xl border border-line bg-white p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-4">
              <h2 className="text-xl font-bold">Roles disponibles</h2>
              <span className="text-sm text-muted">
                {vacancies} {vacancies === 1 ? 'vacante' : 'vacantes'}
              </span>
            </div>
            <ul className="divide-y divide-line">
              {project.roles.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-4 py-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
                    <Code2 size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{r.roleName}</p>
                    <p className="text-xs text-muted">{r.skills.join(' · ')}</p>
                  </div>
                  {r.vacancies > 0 ? (
                    <Badge tone="neutral">
                      {r.vacancies} {r.vacancies === 1 ? 'vacante' : 'vacantes'}
                    </Badge>
                  ) : (
                    <Badge tone="danger">Sin vacantes</Badge>
                  )}
                  {roleAction(r.id, r.vacancies, r.roleName)}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <section className="rounded-3xl border border-line bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">
                {initialsOf(project.creatorName) || <UserRound size={18} aria-hidden="true" />}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted">Creador</p>
                <p className="truncate font-semibold">{project.creatorName}</p>
              </div>
            </div>
            {project.creatorBio && <p className="mt-3 text-sm text-muted">{project.creatorBio}</p>}
            {creatorHasProfile && (
              <ButtonLink to={`/app/perfil/${project.creatorId}`} variant="secondary" size="sm" className="mt-4 w-full">
                Ver perfil
              </ButtonLink>
            )}
            <hr className="my-5 border-line" />
            <h2 className="text-base font-bold">Equipo actual</h2>
            <div className="mt-3 flex items-center justify-between">
              <TeamAvatars names={team} />
              <span className="text-xs text-muted">{teamSize(project)} integrantes</span>
            </div>

            {isCreator ? (
              <div className="mt-5 border-t border-line pt-5">
                <ProjectStatusSelector
                  project={project}
                  ownerId={userId}
                  onChanged={(updated) => setProject(updated)}
                />
              </div>
            ) : applied ? (
              <p className="mt-5 flex items-center gap-2 rounded-xl bg-success-50 px-4 py-3 text-sm font-medium text-success-600">
                <Check size={16} aria-hidden="true" /> Ya enviaste tu postulación
              </p>
            ) : (
              <Button
                className="mt-5 w-full"
                disabled={!isOpen || !firstFree}
                onClick={() => firstFree && setApplyRoleId(firstFree.id)}
              >
                Postularme a este proyecto
              </Button>
            )}
            {!isCreator && !isOpen && (
              <p className="mt-3 text-xs text-muted">Este proyecto no recibe postulaciones por ahora.</p>
            )}
          </section>
        </aside>
      </div>

      <ApplyRoleModal
        open={applyRoleId !== null}
        userId={userId}
        initialProjectId={project.id}
        initialRoleId={applyRoleId ?? undefined}
        onClose={() => setApplyRoleId(null)}
        onApplied={() => {
          setApplied(true)
          setJustApplied(true)
        }}
      />
    </div>
  )
}
