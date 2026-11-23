export type ExternalTool = 'github' | 'figma' | 'trello'

export const EXTERNAL_TOOL_LABELS: Record<ExternalTool, string> = {
  github: 'GitHub',
  figma: 'Figma',
  trello: 'Trello',
}

/**
 * pending      Asociada a una cuenta; espera la validación del creador.
 * validated    El creador la validó (aparece en el perfil del colaborador, HU41).
 * rejected     El creador la rechazó.
 * unassociated Ninguna cuenta coincide con el correo del evento externo.
 */
export type ContributionStatus = 'pending' | 'validated' | 'rejected' | 'unassociated'

export interface Contribution {
  id: string
  projectId: string
  projectTitle: string
  creatorId: string
  tool: ExternalTool
  summary: string
  url?: string
  /** Correo con el que llegó el evento de la herramienta externa. */
  actorEmail: string
  collaboratorId?: string
  collaboratorName?: string
  status: ContributionStatus
  receivedAt: string
  reviewedAt?: string
}

/** Evento que el backend recibe por webhook de GitHub, Figma o Trello. */
export interface ExternalEvent {
  projectId: string
  tool: ExternalTool
  actorEmail: string
  summary: string
  url?: string
}

export type ContributionsErrorCode =
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'NOT_PENDING'
  | 'NOT_ASSOCIATED'
  | 'UNKNOWN_PROJECT'

export class ContributionsError extends Error {
  readonly code: ContributionsErrorCode
  constructor(code: ContributionsErrorCode, message: string) {
    super(message)
    this.name = 'ContributionsError'
    this.code = code
  }
}

/** Contrato del servicio de contribuciones externas (HU43; HU41 lee las validadas). */
export interface ContributionsService {
  listForCreator(creatorId: string, status?: ContributionStatus): Promise<Contribution[]>
  validate(contributionId: string, creatorId: string): Promise<Contribution>
  reject(contributionId: string, creatorId: string): Promise<Contribution>
  /** HU41: contribuciones validadas de un colaborador, para su perfil público. */
  listValidatedForUser(userId: string): Promise<Contribution[]>
  /** Simula la recepción del webhook (en producción lo hace el backend). */
  receiveExternalEvent(event: ExternalEvent): Promise<Contribution>
}
