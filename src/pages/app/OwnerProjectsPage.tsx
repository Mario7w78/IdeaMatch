import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { isApiEnabled } from '../../services/http/apiClient'
import { ownerProjectsService, type OwnerProject } from '../../services/projects/ownerProjects'

export function OwnerProjectsPage() {
  const [projects, setProjects] = useState<OwnerProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!isApiEnabled()) return
    let active = true
    ownerProjectsService.list().then((items) => { if (active) setProjects(items) })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los proyectos.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  return <section className="space-y-6">
    <div><h1 className="text-3xl font-bold">Mis proyectos</h1><p className="mt-2 text-muted">Gestiona las postulaciones de tus proyectos publicados.</p></div>
    {!isApiEnabled() ? <Alert tone="error">Configura VITE_API_URL para consultar tus proyectos del backend.</Alert> : null}
    {error && <Alert tone="error">{error}</Alert>}
    {loading && isApiEnabled() && <p role="status">Cargando proyectos…</p>}
    {!loading && !error && projects.length === 0 && <p className="rounded-2xl border border-line bg-white p-8 text-center text-muted">Todavía no tienes proyectos en el backend.</p>}
    <ul className="grid gap-4 md:grid-cols-2">{projects.map((project) => <li key={project.id} className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-xl font-bold">{project.name}</h2>
      <p className="mt-2 text-sm text-muted">Estado: {project.status} · {project.pendingApplications ?? 0} postulaciones pendientes</p>
      <Link className="mt-5 inline-block text-sm font-semibold text-brand-700 hover:underline" to={`/app/proyecto/${project.id}/postulaciones`}>Ver postulaciones recibidas</Link>
      <Link className="ml-4 mt-5 inline-block text-sm font-semibold text-brand-700 hover:underline" to={`/app/proyecto/${project.id}/equipo`}>Ver equipo</Link>
    </li>)}</ul>
  </section>
}
