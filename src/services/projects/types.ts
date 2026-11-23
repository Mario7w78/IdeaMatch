/**
 * Estados del proyecto (RF13).
 * HU14 permite elegir Abierto, En curso, Pausado y Cerrado; «Cancelado» lo
 * gestiona HU15 (cancelación / archivado).
 */
export type ProjectStatus = 'OPEN' | 'IN_PROGRESS' | 'PAUSED' | 'CLOSED' | 'CANCELLED'

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En curso',
  PAUSED: 'Pausado',
  CLOSED: 'Cerrado',
  CANCELLED: 'Cancelado',
}

/** Estados que el creador puede elegir desde el selector de HU14. */
export const SELECTABLE_STATUSES: ProjectStatus[] = ['OPEN', 'IN_PROGRESS', 'PAUSED', 'CLOSED']

/**
 * Transiciones válidas. Un proyecto Cerrado solo puede reabrirse (Abierto);
 * pasar de Cerrado o Cancelado a «En curso» es una transición no válida.
 */
export const STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  OPEN: ['IN_PROGRESS', 'PAUSED', 'CLOSED'],
  IN_PROGRESS: ['PAUSED', 'CLOSED'],
  PAUSED: ['OPEN', 'IN_PROGRESS', 'CLOSED'],
  CLOSED: ['OPEN'],
  CANCELLED: [],
}

export interface ProjectRole {
  id: string
  projectId: string
  roleName: string
  skills: string[]
  vacancies: number
}

export interface ProjectMember {
  userId: string
  name: string
  roleName: string
}

export interface Project {
  id: string
  title: string
  category: string
  summary: string
  status: ProjectStatus
  roles: ProjectRole[]
  /** Descripción extensa («La idea»). */
  description: string
  /** Lo que el equipo quiere construir (3 objetivos). */
  goals: string[]
  /** Etiquetas visibles en la portada (categoría incluida). */
  tags: string[]
  creatorId: string
  creatorName: string
  creatorBio: string
  createdAt: string
  /** Integrantes aceptados, sin contar al creador. */
  members: ProjectMember[]
}

export interface ListProjectsQuery {
  page?: number
  pageSize?: number
}

export interface ProjectsPage {
  items: Project[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ProjectsErrorCode = 'PROJECT_NOT_FOUND' | 'FORBIDDEN' | 'INVALID_TRANSITION'

export class ProjectsError extends Error {
  readonly code: ProjectsErrorCode
  constructor(code: ProjectsErrorCode, message: string) {
    super(message)
    this.name = 'ProjectsError'
    this.code = code
  }
}

/**
 * Contrato del servicio de proyectos.
 * HU16 (catálogo), HU17 (detalle) y HU14 (cambio de estado). HU11–HU13 y HU18–HU20
 * (publicar, editar, buscar, filtrar, ordenar) amplían esta interfaz.
 */
export interface ProjectsService {
  /** Catálogo: solo proyectos «Abierto», más recientes primero, paginado (10 por defecto). */
  listOpenProjects(query?: ListProjectsQuery): Promise<ProjectsPage>
  getProject(projectId: string): Promise<Project | null>
  /** Solo el creador puede cambiar el estado, y solo con una transición válida. */
  changeStatus(projectId: string, ownerId: string, next: ProjectStatus): Promise<Project>
}

/** Vacantes libres sumando todos los roles. */
export const openVacancies = (p: Pick<Project, 'roles'>): number =>
  p.roles.reduce((total, r) => total + Math.max(0, r.vacancies), 0)

/** Integrantes del equipo, contando al creador. */
export const teamSize = (p: Pick<Project, 'members'>): number => p.members.length + 1
