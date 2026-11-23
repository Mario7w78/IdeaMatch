import {
  ApplicationError,
  type Application,
  type ApplicationProject,
  type ApplicationService,
  type ApplicationStats,
  type CreateApplicationInput,
} from './types'

const STORAGE_APPLICATIONS_KEY = 'ideamatch_mock_applications_v1'
const STORAGE_PROJECTS_KEY = 'ideamatch_mock_projects_v1'

export const SEED_PROJECTS: ApplicationProject[] = [
  {
    id: 'proj-neurobloom',
    title: 'NeuroBloom',
    category: 'Salud digital',
    summary: 'Bienestar emocional, un pequeño hábito a la vez.',
    status: 'OPEN',
    roles: [
      {
        id: 'role-nb-designer',
        projectId: 'proj-neurobloom',
        roleName: 'Product Designer',
        skills: ['Figma', 'UX Research', 'Design Systems'],
        vacancies: 3,
      },
      {
        id: 'role-nb-frontend',
        projectId: 'proj-neurobloom',
        roleName: 'Frontend Developer',
        skills: ['React', 'TypeScript', 'APIs'],
        vacancies: 2,
      },
      {
        id: 'role-nb-psychology',
        projectId: 'proj-neurobloom',
        roleName: 'Psicólogo/a asesor/a',
        skills: ['Salud mental', 'Contenido', 'Research'],
        vacancies: 1,
      },
      {
        id: 'role-nb-exhausted',
        projectId: 'proj-neurobloom',
        roleName: 'Data Analyst',
        skills: ['Python', 'SQL'],
        vacancies: 0, // Rol sin vacantes para probar HU21 caso alterno
      },
    ],
  },
  {
    id: 'proj-verdecerca',
    title: 'Verde Cerca',
    category: 'Impacto social',
    summary: 'Huertos urbanos comunitarios para conectar vecinos y reverdecer la ciudad.',
    status: 'OPEN',
    roles: [
      {
        id: 'role-vc-researcher',
        projectId: 'proj-verdecerca',
        roleName: 'UX Researcher',
        skills: ['UX Research', 'Community Outreach'],
        vacancies: 1,
      },
    ],
  },
  {
    id: 'proj-orbitfinance',
    title: 'Orbit Finance',
    category: 'Fintech',
    summary: 'Educación financiera gamificada para jóvenes universitarios.',
    status: 'OPEN',
    roles: [
      {
        id: 'role-of-frontend',
        projectId: 'proj-orbitfinance',
        roleName: 'Frontend Developer',
        skills: ['React', 'Tailwind CSS'],
        vacancies: 1,
      },
    ],
  },
  {
    id: 'proj-aurora-closed',
    title: 'Aurora Studio',
    category: 'Arte y tecnología',
    summary: 'Instalaciones interactivas generativas con sensores de movimiento.',
    status: 'CLOSED', // Proyecto cerrado para pruebas
    roles: [
      {
        id: 'role-aurora-creative',
        projectId: 'proj-aurora-closed',
        roleName: 'Creative Coder',
        skills: ['Three.js', 'WebGL'],
        vacancies: 1,
      },
    ],
  },
]

/**
 * Datos semilla alineados fielmente con Figma:
 * - usr-mariana / user1: 6 enviadas (2 en revisión, 1 aceptada, 3 finalizadas: 1 rechazada + 2 canceladas)
 * - usr-daniel / user2: 0 postulaciones (estado vacío)
 */
export const SEED_APPLICATIONS: Record<string, Application> = {
  'app-mb-1': {
    id: 'app-mb-1',
    userId: 'usr-mariana',
    projectId: 'proj-neurobloom',
    projectTitle: 'NeuroBloom',
    projectCategory: 'Salud digital',
    roleId: 'role-nb-designer',
    roleName: 'Product Designer',
    note: 'Me entusiasma crear una experiencia de bienestar cálida, simple y basada en evidencia.',
    status: 'PENDING',
    createdAt: '2026-06-18T10:30:00.000Z',
    updatedAt: '2026-06-18T10:30:00.000Z',
  },
  'app-mb-2': {
    id: 'app-mb-2',
    userId: 'usr-mariana',
    projectId: 'proj-neurobloom-2',
    projectTitle: 'NeuroBloom Insights',
    projectCategory: 'Salud digital',
    roleId: 'role-nb-frontend',
    roleName: 'Frontend Developer',
    note: 'Cuento con experiencia en React y diseño accesible enfocado en salud.',
    status: 'PENDING',
    createdAt: '2026-06-15T16:00:00.000Z',
    updatedAt: '2026-06-15T16:00:00.000Z',
  },
  'app-mb-3': {
    id: 'app-mb-3',
    userId: 'usr-mariana',
    projectId: 'proj-verdecerca',
    projectTitle: 'Verde Cerca',
    projectCategory: 'Impacto social',
    roleId: 'role-vc-researcher',
    roleName: 'UX Researcher',
    note: 'Interesada en los procesos de cocreación con comunidades locales.',
    status: 'ACCEPTED',
    createdAt: '2026-06-12T14:20:00.000Z',
    updatedAt: '2026-06-14T09:00:00.000Z',
  },
  'app-mb-4': {
    id: 'app-mb-4',
    userId: 'usr-mariana',
    projectId: 'proj-orbitfinance',
    projectTitle: 'Orbit Finance',
    projectCategory: 'Fintech',
    roleId: 'role-of-frontend',
    roleName: 'Frontend Developer',
    note: 'Diseño e implementación de sistemas de pago e interfaces limpias.',
    status: 'REJECTED',
    createdAt: '2026-06-02T09:15:00.000Z',
    updatedAt: '2026-06-05T11:45:00.000Z',
  },
  'app-mb-5': {
    id: 'app-mb-5',
    userId: 'usr-mariana',
    projectId: 'proj-alpha',
    projectTitle: 'Alpha Mentoring',
    projectCategory: 'Educación',
    roleId: 'role-alpha-lead',
    roleName: 'Lead Designer',
    note: 'Propuesta de gamificación en mentorías académicas.',
    status: 'CANCELLED',
    createdAt: '2026-05-20T08:00:00.000Z',
    updatedAt: '2026-05-22T10:00:00.000Z',
  },
  'app-mb-6': {
    id: 'app-mb-6',
    userId: 'usr-mariana',
    projectId: 'proj-beta',
    projectTitle: 'Beta Logistics',
    projectCategory: 'Logística',
    roleId: 'role-beta-ux',
    roleName: 'Product Designer',
    note: 'Optimización de rutas y tiempos para operadores.',
    status: 'CANCELLED',
    createdAt: '2026-05-10T12:00:00.000Z',
    updatedAt: '2026-05-11T14:00:00.000Z',
  },
}

// Mapeo canónico de usuarios
function canonicalUserId(id: string): string {
  if (id === 'user1') return 'usr-mariana'
  if (id === 'user2') return 'usr-daniel'
  return id
}

export class MockApplicationService implements ApplicationService {
  private getApplicationsStore(): Record<string, Application> {
    try {
      const raw = localStorage.getItem(STORAGE_APPLICATIONS_KEY)
      let store: Record<string, Application> = {}
      if (raw) {
        try {
          store = JSON.parse(raw) as Record<string, Application>
        } catch {
          store = {}
        }
      }

      let changed = false
      for (const [key, app] of Object.entries(SEED_APPLICATIONS)) {
        if (!store[key]) {
          store[key] = app
          changed = true
        }
      }

      if (changed || !raw) {
        localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify(store))
      }
      return store
    } catch {
      return { ...SEED_APPLICATIONS }
    }
  }

  private saveApplicationsStore(store: Record<string, Application>): void {
    try {
      localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify(store))
    } catch {
      // Ignorar restricciones de almacenamiento
    }
  }

  private getProjectsStore(): ApplicationProject[] {
    try {
      const raw = localStorage.getItem(STORAGE_PROJECTS_KEY)
      if (raw) {
        try {
          return JSON.parse(raw) as ApplicationProject[]
        } catch {
          // fallback
        }
      }
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(SEED_PROJECTS))
      return [...SEED_PROJECTS]
    } catch {
      return [...SEED_PROJECTS]
    }
  }

  async getMyApplications(userId: string): Promise<Application[]> {
    const store = this.getApplicationsStore()
    const targetUserId = canonicalUserId(userId)
    return Object.values(store)
      .filter((app) => canonicalUserId(app.userId) === targetUserId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getApplicationStats(userId: string): Promise<ApplicationStats> {
    const apps = await this.getMyApplications(userId)
    const pending = apps.filter((a) => a.status === 'PENDING').length
    const accepted = apps.filter((a) => a.status === 'ACCEPTED').length
    const finalized = apps.filter((a) => a.status === 'REJECTED' || a.status === 'CANCELLED').length

    return {
      total: apps.length,
      pending,
      accepted,
      finalized,
    }
  }

  async hasAppliedToProject(userId: string, projectId: string): Promise<boolean> {
    const apps = await this.getMyApplications(userId)
    // El usuario cuenta con postulación si tiene una que no esté cancelada
    return apps.some(
      (a) => a.projectId === projectId && a.status !== 'CANCELLED',
    )
  }

  async getProject(projectId: string): Promise<ApplicationProject | null> {
    const projects = this.getProjectsStore()
    return projects.find((p) => p.id === projectId) || null
  }

  async getAvailableProjects(): Promise<ApplicationProject[]> {
    return this.getProjectsStore()
  }

  async applyToRole(userId: string, input: CreateApplicationInput): Promise<Application> {
    const projects = this.getProjectsStore()
    const project = projects.find((p) => p.id === input.projectId)

    if (!project) {
      throw new ApplicationError('APPLICATION_NOT_FOUND', 'El proyecto no existe.')
    }

    if (project.status !== 'OPEN') {
      throw new ApplicationError(
        'PROJECT_NOT_OPEN',
        'No se pueden enviar postulaciones a proyectos que no estén Abiertos.',
      )
    }

    const role = project.roles.find((r) => r.id === input.roleId)
    if (!role) {
      throw new ApplicationError('ROLE_NOT_FOUND', 'El rol seleccionado no pertenece a este proyecto.')
    }

    // Criterio HU21 Alterno: Si el rol ya no cuenta con vacantes disponibles
    if (role.vacancies <= 0) {
      throw new ApplicationError(
        'NO_VACANCIES',
        'El rol seleccionado ya ha cubierto todas sus vacantes.',
      )
    }

    // Criterio HU22 Alterno: Si ya tiene una postulación enviada a esa idea
    const alreadyApplied = await this.hasAppliedToProject(userId, input.projectId)
    if (alreadyApplied) {
      throw new ApplicationError(
        'ALREADY_APPLIED',
        'Ya cuentas con una postulación registrada para este proyecto.',
      )
    }

    // Validación de nota
    if (!input.note || input.note.trim().length < 5) {
      throw new ApplicationError(
        'INVALID_NOTE',
        'Por favor, incluye una breve nota de presentación (mínimo 5 caracteres).',
      )
    }

    // Generar nueva postulación
    const now = new Date().toISOString()
    const newId = `app-${Date.now()}`
    const newApplication: Application = {
      id: newId,
      userId,
      projectId: project.id,
      projectTitle: project.title,
      projectCategory: project.category,
      roleId: role.id,
      roleName: role.roleName,
      note: input.note.trim(),
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    }

    const appStore = this.getApplicationsStore()
    appStore[newId] = newApplication
    this.saveApplicationsStore(appStore)

    return newApplication
  }

  async cancelApplication(_userId: string, applicationId: string): Promise<Application> {
    const appStore = this.getApplicationsStore()
    const app = appStore[applicationId]

    if (!app) {
      throw new ApplicationError('APPLICATION_NOT_FOUND', 'La postulación no fue encontrada.')
    }

    // Criterio HU23 Alterno: Si el creador ya aceptó o rechazó la solicitud
    if (app.status !== 'PENDING') {
      throw new ApplicationError(
        'CANNOT_CANCEL_PROCESSED',
        'No se puede cancelar una postulación que ya ha sido procesada por el creador.',
      )
    }

    // Criterio HU23 Feliz: Pasa a 'Cancelada por Colaborador'
    const updated: Application = {
      ...app,
      status: 'CANCELLED',
      updatedAt: new Date().toISOString(),
    }

    appStore[applicationId] = updated
    this.saveApplicationsStore(appStore)
    return updated
  }

  reset(): void {
    localStorage.removeItem(STORAGE_APPLICATIONS_KEY)
    localStorage.removeItem(STORAGE_PROJECTS_KEY)
  }
}

export const applicationService = new MockApplicationService()
