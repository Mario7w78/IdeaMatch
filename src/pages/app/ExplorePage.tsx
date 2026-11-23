import { LoaderCircle, Rocket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProjectCard } from '../../components/projects/ProjectCard'
import { ButtonLink } from '../../components/ui/Button'
import { Pagination } from '../../components/ui/Pagination'
import { projectsService, type ProjectsPage } from '../../services/projects'

/** HU16: catálogo de proyectos abiertos, 10 tarjetas por página. */
export function ExplorePage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('pagina')) || 1)
  const [result, setResult] = useState<ProjectsPage | null>(null)

  useEffect(() => {
    let active = true
    projectsService.listOpenProjects({ page }).then((r) => {
      if (active) setResult(r)
    })
    return () => {
      active = false
    }
  }, [page])

  function goTo(next: number) {
    setParams(next > 1 ? { pagina: String(next) } : {})
    window.scrollTo({ top: 0 })
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.15em] text-brand-700 uppercase">Explorar</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Explora proyectos</h1>
      {result && result.total > 0 && (
        <p className="mt-3 text-muted">
          {result.total} {result.total === 1 ? 'proyecto abierto' : 'proyectos abiertos'} esperando talento como el tuyo.
        </p>
      )}

      {!result ? (
        <div role="status" className="grid place-items-center py-24 text-muted">
          <LoaderCircle className="animate-spin" aria-label="Cargando proyectos" />
        </div>
      ) : result.total === 0 ? (
        <section className="mt-8 flex flex-col items-center rounded-3xl border border-line bg-white px-6 py-16 text-center">
          <span className="grid size-20 place-items-center rounded-3xl bg-brand-100 text-brand-700">
            <Rocket size={36} aria-hidden="true" />
          </span>
          <h2 className="mt-6 text-2xl font-bold">No se encontraron proyectos activos en este momento</h2>
          <p className="mt-3 max-w-md text-muted">
            Cuando alguien publique una idea, la verás aquí. Mientras tanto, ¿por qué no publicas la tuya?
          </p>
          <ButtonLink to="/app/publicar" className="mt-8">
            Publicar una idea
          </ButtonLink>
        </section>
      ) : (
        <>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Proyectos abiertos">
            {result.items.map((p) => (
              <li key={p.id} className="h-full">
                <ProjectCard project={p} />
              </li>
            ))}
          </ul>
          <Pagination page={result.page} totalPages={result.totalPages} onChange={goTo} />
        </>
      )}
    </div>
  )
}
