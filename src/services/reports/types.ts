export type ReportCause = 'spam' | 'inappropriate' | 'misleading' | 'other'

export const REPORT_CAUSE_LABELS: Record<ReportCause, string> = {
  spam: 'Spam',
  inappropriate: 'Contenido inapropiado',
  misleading: 'Información engañosa',
  other: 'Otro motivo',
}

export type ReportStatus = 'pending' | 'resolved' | 'dismissed'

export interface Report {
  id: string
  projectId: string
  projectTitle: string
  creatorId: string
  creatorName: string
  creatorEmail: string
  reporterId: string
  reporterName: string
  cause: ReportCause
  reason: string
  status: ReportStatus
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
  /** Acción tomada por el administrador (solo en reportes resueltos). */
  action?: 'project_suspended'
}

export type ReportsErrorCode =
  | 'REPORT_NOT_FOUND'
  | 'ALREADY_HANDLED'
  | 'EMPTY_REASON'
  | 'DUPLICATE_REPORT'

export class ReportsError extends Error {
  readonly code: ReportsErrorCode
  constructor(code: ReportsErrorCode, message: string) {
    super(message)
    this.name = 'ReportsError'
    this.code = code
  }
}

export interface CreateReportInput {
  projectId: string
  projectTitle: string
  creatorId?: string
  creatorName?: string
  creatorEmail?: string
  reporterId: string
  reporterName: string
  cause: ReportCause
  reason: string
}

/**
 * Contrato del servicio de reportes y moderación.
 * HU40 (administrador): listar, suspender el proyecto o descartar el reporte.
 * HU39 (crear un reporte desde la vista de un proyecto) extiende esta interfaz
 * con `createReport` sobre el mismo almacenamiento.
 */
export interface ReportsService {
  listReports(status?: ReportStatus): Promise<Report[]>
  createReport(input: CreateReportInput): Promise<Report>
  suspendProject(reportId: string, adminId: string): Promise<Report>
  dismissReport(reportId: string, adminId: string): Promise<Report>
  isProjectSuspended(projectId: string): Promise<boolean>
}
