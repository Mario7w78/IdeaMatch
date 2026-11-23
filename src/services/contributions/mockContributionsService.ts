import {
  ContributionsError,
  type Contribution,
  type ContributionStatus,
  type ContributionsService,
  type ExternalEvent,
} from './types'

const STORAGE_KEY = 'ideamatch_mock_contributions_v1'
/** Mismo almacenamiento del servicio de autenticación simulado (cuentas). */
const USERS_KEY = 'im.users'

/** Proyectos de prueba hasta que exista el servicio de proyectos. */
const PROJECTS: Record<string, { title: string; creatorId: string }> = {
  'proj-ecoruta': { title: 'EcoRuta: movilidad sostenible', creatorId: 'user1' },
  'proj-huertos': { title: 'Huertos urbanos conectados', creatorId: 'user1' },
}

const SEED_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'con-1',
    projectId: 'proj-ecoruta',
    projectTitle: 'EcoRuta: movilidad sostenible',
    creatorId: 'user1',
    tool: 'github',
    summary: 'Pull request #14: ruta de bicicletas en el mapa',
    url: 'https://github.com/ideamatch/ecoruta/pull/14',
    actorEmail: 'user2@ideamatch.com',
    collaboratorId: 'user2',
    collaboratorName: 'User 2',
    status: 'pending',
    receivedAt: '2026-11-20T14:05:00.000Z',
  },
  {
    id: 'con-2',
    projectId: 'proj-huertos',
    projectTitle: 'Huertos urbanos conectados',
    creatorId: 'user1',
    tool: 'figma',
    summary: 'Prototipo de la pantalla de siembra',
    url: 'https://www.figma.com/file/huertos-siembra',
    actorEmail: 'user2@ideamatch.com',
    collaboratorId: 'user2',
    collaboratorName: 'User 2',
    status: 'pending',
    receivedAt: '2026-11-21T10:30:00.000Z',
  },
  {
    id: 'con-3',
    projectId: 'proj-ecoruta',
    projectTitle: 'EcoRuta: movilidad sostenible',
    creatorId: 'user1',
    tool: 'trello',
    summary: 'Tarjeta movida a «Hecho»: integrar la API del clima',
    actorEmail: 'dev.externo@correo.com',
    status: 'unassociated',
    receivedAt: '2026-11-21T16:48:00.000Z',
  },
  {
    id: 'con-4',
    projectId: 'proj-ecoruta',
    projectTitle: 'EcoRuta: movilidad sostenible',
    creatorId: 'user1',
    tool: 'github',
    summary: 'Pull request #9: pantalla de inicio de sesión',
    url: 'https://github.com/ideamatch/ecoruta/pull/9',
    actorEmail: 'user2@ideamatch.com',
    collaboratorId: 'user2',
    collaboratorName: 'User 2',
    status: 'validated',
    receivedAt: '2026-11-18T09:12:00.000Z',
    reviewedAt: '2026-11-18T17:00:00.000Z',
  },
]

interface AccountRef {
  id: string
  name: string
}

/** Busca una cuenta por el correo del evento externo (sin distinguir mayúsculas). */
function findAccountByEmail(email: string): AccountRef | null {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    const users = raw
      ? (JSON.parse(raw) as { id: string; firstName: string; lastName: string; email: string }[])
      : []
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    return found ? { id: found.id, name: `${found.firstName} ${found.lastName}` } : null
  } catch {
    return null
  }
}

/** Implementación simulada (localStorage) de las contribuciones externas. */
export class MockContributionsService implements ContributionsService {
  private load(): Contribution[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as Contribution[]
    } catch {
      /* se usan los datos semilla */
    }
    return structuredClone(SEED_CONTRIBUTIONS)
  }

  private save(list: Contribution[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  private review(
    contributionId: string,
    creatorId: string,
    next: Extract<ContributionStatus, 'validated' | 'rejected'>,
  ): Contribution {
    const list = this.load()
    const item = list.find((c) => c.id === contributionId)
    if (!item) throw new ContributionsError('NOT_FOUND', 'La contribución no existe')
    if (item.creatorId !== creatorId) {
      throw new ContributionsError('FORBIDDEN', 'Solo el creador del proyecto puede revisar esta contribución')
    }
    if (item.status === 'unassociated') {
      throw new ContributionsError('NOT_ASSOCIATED', 'Una contribución no asociada no se puede validar')
    }
    if (item.status !== 'pending') {
      throw new ContributionsError('NOT_PENDING', 'Esta contribución ya no está pendiente de validación')
    }
    item.status = next
    item.reviewedAt = new Date().toISOString()
    this.save(list)
    return item
  }

  async listForCreator(creatorId: string, status?: ContributionStatus): Promise<Contribution[]> {
    return this.load()
      .filter((c) => c.creatorId === creatorId && (!status || c.status === status))
      .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
  }

  async validate(contributionId: string, creatorId: string): Promise<Contribution> {
    return this.review(contributionId, creatorId, 'validated')
  }

  async reject(contributionId: string, creatorId: string): Promise<Contribution> {
    return this.review(contributionId, creatorId, 'rejected')
  }

  async listValidatedForUser(userId: string): Promise<Contribution[]> {
    return this.load()
      .filter((c) => c.collaboratorId === userId && c.status === 'validated')
      .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
  }

  async receiveExternalEvent(event: ExternalEvent): Promise<Contribution> {
    const project = PROJECTS[event.projectId]
    if (!project) throw new ContributionsError('UNKNOWN_PROJECT', 'El proyecto del evento no existe')

    const account = findAccountByEmail(event.actorEmail)
    const contribution: Contribution = {
      id: crypto.randomUUID(),
      projectId: event.projectId,
      projectTitle: project.title,
      creatorId: project.creatorId,
      tool: event.tool,
      summary: event.summary,
      url: event.url,
      actorEmail: event.actorEmail.trim().toLowerCase(),
      collaboratorId: account?.id,
      collaboratorName: account?.name,
      status: account ? 'pending' : 'unassociated',
      receivedAt: new Date().toISOString(),
    }
    this.save([...this.load(), contribution])
    return contribution
  }

  /** Método auxiliar para pruebas: restablecer datos semilla. */
  reset(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const contributionsService = new MockContributionsService()
