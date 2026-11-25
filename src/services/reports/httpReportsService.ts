import { ApiError, apiRequest } from '../http/apiClient'
import {
  ReportsError,
  type CreateReportInput,
  type Report,
  type ReportStatus,
  type ReportsService,
} from './types'

/** Reporte tal como lo devuelve `/api/admin/reports`. */
interface ApiReport {
  id: string | number
  project: { id: string | number; name: string | null; status: string | null }
  reason: Report['cause']
  description: string
  status: 'abierto' | 'resuelto'
  resolution: 'suspend_project' | 'dismiss' | null
  createdAt: string
  resolvedAt: string | null
  reporter: { id: string | number; name: string }
  resolvedBy: { id: string | number; name: string } | null
}

const PAGE_SIZE = 50
const MAX_PAGES = 10

function toReport(r: ApiReport): Report {
  const status: ReportStatus =
    r.status === 'abierto' ? 'pending' : r.resolution === 'dismiss' ? 'dismissed' : 'resolved'
  return {
    id: String(r.id),
    projectId: String(r.project.id),
    projectTitle: r.project.name ?? 'Proyecto eliminado',
    // La cola del backend no incluye al creador del proyecto.
    creatorId: '',
    creatorName: '',
    creatorEmail: '',
    reporterId: String(r.reporter.id),
    reporterName: r.reporter.name,
    cause: r.reason,
    reason: r.description,
    status,
    createdAt: r.createdAt,
    resolvedAt: r.resolvedAt ?? undefined,
    resolvedBy: r.resolvedBy ? String(r.resolvedBy.id) : undefined,
    action: r.resolution === 'suspend_project' ? 'project_suspended' : undefined,
  }
}

function toReportsError(err: unknown): never {
  if (err instanceof ApiError) {
    if (err.code === 'ALREADY_REPORTED')
      throw new ReportsError('DUPLICATE_REPORT', 'Ya registraste un reporte para esta publicación')
    if (err.code === 'CANNOT_REPORT_OWN')
      throw new ReportsError('OWN_PROJECT', 'No puedes reportar tu propio proyecto')
    if (err.code === 'REPORT_NOT_FOUND') throw new ReportsError('REPORT_NOT_FOUND', 'El reporte no existe')
    if (err.code === 'ALREADY_RESOLVED') throw new ReportsError('ALREADY_HANDLED', 'Este reporte ya fue gestionado')
    if (err.code === 'VALIDATION') throw new ReportsError('EMPTY_REASON', 'Proporcione un motivo')
  }
  throw err
}

/** Implementación contra el backend real (`/api/projects/:id/reports` y `/api/admin/reports`). */
export class HttpReportsService implements ReportsService {
  async listReports(status?: ReportStatus): Promise<Report[]> {
    const items: ApiReport[] = []
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await apiRequest<{ items: ApiReport[]; total: number }>('/admin/reports', {
        query: {
          status: status === undefined ? undefined : status === 'pending' ? 'abierto' : 'resuelto',
          page,
          limit: PAGE_SIZE,
        },
      })
      items.push(...res.items)
      if (items.length >= res.total || res.items.length === 0) break
    }
    const reports = items.map(toReport)
    // El backend agrupa "resuelto" y "desestimado" bajo el mismo estado.
    return status === 'resolved' || status === 'dismissed' ? reports.filter((r) => r.status === status) : reports
  }

  async createReport(input: CreateReportInput): Promise<Report> {
    const description = input.reason?.trim() ?? ''
    if (!description) throw new ReportsError('EMPTY_REASON', 'Proporcione un motivo')
    try {
      const res = await apiRequest<{ report: { id: string | number; createdAt: string } }>(
        `/projects/${encodeURIComponent(input.projectId)}/reports`,
        { method: 'POST', body: { reason: input.cause, description } },
      )
      return {
        id: String(res.report.id),
        projectId: input.projectId,
        projectTitle: input.projectTitle,
        creatorId: input.creatorId ?? '',
        creatorName: input.creatorName ?? '',
        creatorEmail: input.creatorEmail ?? '',
        reporterId: input.reporterId,
        reporterName: input.reporterName,
        cause: input.cause,
        reason: description,
        status: 'pending',
        createdAt: res.report.createdAt,
      }
    } catch (err) {
      toReportsError(err)
    }
  }

  private async resolve(reportId: string, action: 'suspend_project' | 'dismiss'): Promise<Report> {
    try {
      const res = await apiRequest<{ report: ApiReport }>(`/admin/reports/${encodeURIComponent(reportId)}/resolve`, {
        method: 'POST',
        body: { action },
      })
      return toReport(res.report)
    } catch (err) {
      toReportsError(err)
    }
  }

  // El administrador sale de la sesión (token), por eso `adminId` no se envía.
  suspendProject(reportId: string): Promise<Report> {
    return this.resolve(reportId, 'suspend_project')
  }

  dismissReport(reportId: string): Promise<Report> {
    return this.resolve(reportId, 'dismiss')
  }

  async isProjectSuspended(projectId: string): Promise<boolean> {
    try {
      const project = await apiRequest<{ status?: string }>(`/projects/${encodeURIComponent(projectId)}`)
      return project.status === 'suspendido'
    } catch (err) {
      // Un proyecto suspendido u oculto responde 404 a quien no es su creador.
      if (err instanceof ApiError && err.status === 404) return true
      throw err
    }
  }

  reset(): void {
    /* sin estado local */
  }
}
