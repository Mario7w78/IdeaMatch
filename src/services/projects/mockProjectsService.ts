import { SEED_PROJECTS } from '../applications/mockApplicationService'
import type { ApplicationProject } from '../applications/types'
import { CATALOG_SEEDS, detailsFor } from './seedProjects'
import {
  ProjectsError,
  STATUS_TRANSITIONS,
  type ListProjectsQuery,
  type Project,
  type ProjectStatus,
  type ProjectsPage,
  type ProjectsService,
} from './types'

/** Mismo almacenamiento que el servicio de postulaciones: el estado y las vacantes son únicos. */
export const PROJECTS_STORAGE_KEY = 'ideamatch_mock_projects_v1'
const CATALOG_FLAG_KEY = 'ideamatch_mock_projects_catalog_v1'
export const DEFAULT_PAGE_SIZE = 10

/** Lo que se guarda: lo mínimo de postulaciones más los datos de presentación opcionales. */
type Stored = ApplicationProject & Partial<Omit<Project, keyof ApplicationProject>>

const NOT_FOUND = () => new ProjectsError('PROJECT_NOT_FOUND', 'El proyecto no existe o fue eliminado')

function toProject(s: Stored): Project {
  const details = detailsFor(s.id)
  return {
    id: s.id,
    title: s.title,
    category: s.category,
    summary: s.summary,
    status: s.status,
    roles: s.roles,
    description: s.description ?? details?.description ?? s.summary,
    goals: s.goals ?? details?.goals ?? [],
    tags: s.tags ?? details?.tags ?? [s.category],
    creatorId: s.creatorId ?? details?.creatorId ?? '',
    creatorName: s.creatorName ?? details?.creatorName ?? 'Creador',
    creatorBio: s.creatorBio ?? details?.creatorBio ?? '',
    createdAt: s.createdAt ?? details?.createdAt ?? new Date(0).toISOString(),
    members: s.members ?? details?.members ?? [],
  }
}

/** Implementación simulada (localStorage) del catálogo, el detalle y el estado de proyectos. */
export class MockProjectsService implements ProjectsService {
  private load(): Stored[] {
    let list: Stored[] | null = null
    try {
      const raw = localStorage.getItem(PROJECTS_STORAGE_KEY)
      if (raw) list = JSON.parse(raw) as Stored[]
    } catch {
      list = null
    }
    if (!list) list = structuredClone(SEED_PROJECTS)

    // Una sola vez: suma los proyectos de ejemplo del catálogo (hay más de una página).
    if (!localStorage.getItem(CATALOG_FLAG_KEY)) {
      for (const seed of CATALOG_SEEDS) {
        if (!list.some((p) => p.id === seed.id)) list.push(structuredClone(seed))
      }
      this.save(list)
      localStorage.setItem(CATALOG_FLAG_KEY, '1')
    }
    return list
  }

  private save(list: Stored[]) {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(list))
  }

  async listOpenProjects(query: ListProjectsQuery = {}): Promise<ProjectsPage> {
    const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE)
    const open = this.load()
      .map(toProject)
      .filter((p) => p.status === 'OPEN')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const totalPages = Math.max(1, Math.ceil(open.length / pageSize))
    const page = Math.min(Math.max(1, query.page ?? 1), totalPages)
    return {
      items: open.slice((page - 1) * pageSize, page * pageSize),
      total: open.length,
      page,
      pageSize,
      totalPages,
    }
  }

  async getProject(projectId: string): Promise<Project | null> {
    const found = this.load().find((p) => p.id === projectId)
    return found ? toProject(found) : null
  }

  async changeStatus(projectId: string, ownerId: string, next: ProjectStatus): Promise<Project> {
    const list = this.load()
    const stored = list.find((p) => p.id === projectId)
    if (!stored) throw NOT_FOUND()
    const project = toProject(stored)
    if (project.creatorId !== ownerId) {
      throw new ProjectsError('FORBIDDEN', 'No posee permisos para editar este proyecto')
    }
    if (!STATUS_TRANSITIONS[project.status].includes(next)) {
      throw new ProjectsError('INVALID_TRANSITION', 'Transición de estado no válida')
    }
    stored.status = next
    this.save(list)
    return toProject(stored)
  }

  /** Sustituye todo el catálogo (pruebas y herramientas de desarrollo). */
  replaceAll(projects: ApplicationProject[]): void {
    this.save(projects)
    localStorage.setItem(CATALOG_FLAG_KEY, '1')
  }

  /** Método auxiliar para pruebas: restablecer datos semilla. */
  reset(): void {
    localStorage.removeItem(PROJECTS_STORAGE_KEY)
    localStorage.removeItem(CATALOG_FLAG_KEY)
  }
}

export const projectsService = new MockProjectsService()
