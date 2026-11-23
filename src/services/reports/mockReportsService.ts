import { sendMail } from '../mailbox'
import {
  ReportsError,
  type CreateReportInput,
  type Report,
  type ReportStatus,
  type ReportsService,
} from './types'

const STORAGE_KEY = 'ideamatch_mock_reports_v1'

interface Store {
  reports: Report[]
  suspendedProjects: string[]
}

const SEED_REPORTS: Report[] = [
  {
    id: 'rep-1',
    projectId: 'proj-casino',
    projectTitle: 'Casino online para estudiantes',
    creatorId: 'usr-carlos',
    creatorName: 'Carlos Pérez',
    creatorEmail: 'carlos.perez@correo.com',
    reporterId: 'user2',
    reporterName: 'User 2',
    cause: 'inappropriate',
    reason: 'Promueve apuestas con dinero real dirigidas a menores de edad.',
    status: 'pending',
    createdAt: '2026-11-20T15:10:00.000Z',
  },
  {
    id: 'rep-2',
    projectId: 'proj-ingresos',
    projectTitle: 'Gana $5000 diarios sin esfuerzo',
    creatorId: 'usr-luis',
    creatorName: 'Luis Rivas',
    creatorEmail: 'luis.rivas@correo.com',
    reporterId: 'user1',
    reporterName: 'User 1',
    cause: 'spam',
    reason: 'Publicación repetida con enlaces externos sospechosos.',
    status: 'pending',
    createdAt: '2026-11-21T09:42:00.000Z',
  },
  {
    id: 'rep-3',
    projectId: 'proj-tutorias',
    projectTitle: 'Plataforma de tutorías entre pares',
    creatorId: 'usr-marta',
    creatorName: 'Marta Díaz',
    creatorEmail: 'marta.diaz@correo.com',
    reporterId: 'usr-ana',
    reporterName: 'Ana Gómez',
    cause: 'misleading',
    reason: 'Afirma tener el respaldo de una universidad sin presentar evidencia.',
    status: 'pending',
    createdAt: '2026-11-21T18:25:00.000Z',
  },
  {
    id: 'rep-4',
    projectId: 'proj-huertos',
    projectTitle: 'Huertos urbanos conectados',
    creatorId: 'user1',
    creatorName: 'User 1',
    creatorEmail: 'user1@ideamatch.com',
    reporterId: 'usr-ana',
    reporterName: 'Ana Gómez',
    cause: 'other',
    reason: 'No me gusta la propuesta.',
    status: 'dismissed',
    createdAt: '2026-11-19T11:00:00.000Z',
    resolvedAt: '2026-11-19T16:30:00.000Z',
    resolvedBy: 'admin1',
  },
]

/** Implementación simulada (localStorage) de reportes y moderación. */
export class MockReportsService implements ReportsService {
  private load(): Store {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as Store
    } catch {
      /* se usan los datos semilla */
    }
    return { reports: structuredClone(SEED_REPORTS), suspendedProjects: [] }
  }

  private save(store: Store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }

  private find(store: Store, reportId: string): Report {
    const report = store.reports.find((r) => r.id === reportId)
    if (!report) throw new ReportsError('REPORT_NOT_FOUND', 'El reporte no existe')
    if (report.status !== 'pending') {
      throw new ReportsError('ALREADY_HANDLED', 'Este reporte ya fue gestionado')
    }
    return report
  }

  async listReports(status?: ReportStatus): Promise<Report[]> {
    const { reports } = this.load()
    const list = status ? reports.filter((r) => r.status === status) : reports
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async createReport(input: CreateReportInput): Promise<Report> {
    const reasonTrimmed = input.reason?.trim() ?? ''
    if (!reasonTrimmed) {
      throw new ReportsError('EMPTY_REASON', 'Proporcione un motivo')
    }

    const store = this.load()
    const isDuplicate = store.reports.some(
      (r) => r.projectId === input.projectId && r.reporterId === input.reporterId,
    )
    if (isDuplicate) {
      throw new ReportsError('DUPLICATE_REPORT', 'Ya registraste un reporte para esta publicación')
    }

    const report: Report = {
      id: `rep-${crypto.randomUUID()}`,
      projectId: input.projectId,
      projectTitle: input.projectTitle,
      creatorId: input.creatorId ?? 'usr-unknown',
      creatorName: input.creatorName ?? 'Creador',
      creatorEmail: input.creatorEmail ?? 'creador@ideamatch.com',
      reporterId: input.reporterId,
      reporterName: input.reporterName,
      cause: input.cause,
      reason: reasonTrimmed,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    store.reports.unshift(report)
    this.save(store)
    return report
  }

  async suspendProject(reportId: string, adminId: string): Promise<Report> {
    const store = this.load()
    const report = this.find(store, reportId)
    const alreadySuspended = store.suspendedProjects.includes(report.projectId)

    report.status = 'resolved'
    report.action = 'project_suspended'
    report.resolvedAt = new Date().toISOString()
    report.resolvedBy = adminId
    if (!alreadySuspended) store.suspendedProjects.push(report.projectId)
    this.save(store)

    // Se avisa al creador (una sola vez por proyecto).
    if (!alreadySuspended) {
      sendMail({
        to: report.creatorEmail,
        subject: 'Tu proyecto fue suspendido en IdeaMatch',
        body: `Hola ${report.creatorName}, tu proyecto «${report.projectTitle}» se ocultó del público tras revisar un reporte de la comunidad.`,
        link: `${window.location.origin}/app/mis-proyectos`,
      })
    }
    return report
  }

  async dismissReport(reportId: string, adminId: string): Promise<Report> {
    const store = this.load()
    const report = this.find(store, reportId)
    report.status = 'dismissed'
    report.resolvedAt = new Date().toISOString()
    report.resolvedBy = adminId
    this.save(store)
    return report
  }

  async isProjectSuspended(projectId: string): Promise<boolean> {
    return this.load().suspendedProjects.includes(projectId)
  }

  /** Método auxiliar para pruebas: restablecer datos semilla. */
  reset(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const reportsService = new MockReportsService()
