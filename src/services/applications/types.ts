import type { ProjectStatus } from '../projects/types'

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'

export interface Application {
  id: string
  userId: string
  projectId: string
  projectTitle: string
  projectCategory: string
  roleId: string
  roleName: string
  note: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export interface ApplicationRole {
  id: string
  projectId: string
  roleName: string
  skills: string[]
  vacancies: number
}

export interface ApplicationProject {
  id: string
  title: string
  category: string
  summary: string
  status: ProjectStatus
  roles: ApplicationRole[]
}

export interface CreateApplicationInput {
  projectId: string
  roleId: string
  note: string
}

export interface ApplicationStats {
  total: number
  pending: number
  accepted: number
  finalized: number
}

export type ApplicationErrorCode =
  | 'APPLICATION_NOT_FOUND'
  | 'ALREADY_APPLIED'
  | 'NO_VACANCIES'
  | 'CANNOT_CANCEL_PROCESSED'
  | 'INVALID_NOTE'
  | 'PROJECT_NOT_OPEN'
  | 'ROLE_NOT_FOUND'

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode
  constructor(code: ApplicationErrorCode, message: string) {
    super(message)
    this.name = 'ApplicationError'
    this.code = code
  }
}

export interface ApplicationService {
  getMyApplications(userId: string): Promise<Application[]>
  getApplicationStats(userId: string): Promise<ApplicationStats>
  applyToRole(userId: string, input: CreateApplicationInput): Promise<Application>
  cancelApplication(userId: string, applicationId: string): Promise<Application>
  hasAppliedToProject(userId: string, projectId: string): Promise<boolean>
  getProject(projectId: string): Promise<ApplicationProject | null>
  getAvailableProjects(): Promise<ApplicationProject[]>
  reset(): void
}
