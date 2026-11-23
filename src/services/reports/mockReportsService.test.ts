import { beforeEach, describe, expect, it } from 'vitest'
import { readMailbox } from '../mailbox'
import { MockReportsService } from './mockReportsService'
import { ReportsError } from './types'

describe('MockReportsService (HU40)', () => {
  let service: MockReportsService

  beforeEach(() => {
    localStorage.clear()
    service = new MockReportsService()
  })

  it('lista los reportes pendientes, del más reciente al más antiguo', async () => {
    const pending = await service.listReports('pending')
    expect(pending.map((r) => r.id)).toEqual(['rep-3', 'rep-2', 'rep-1'])
  })

  it('suspender un proyecto oculta el proyecto, resuelve el reporte y avisa al creador', async () => {
    const report = await service.suspendProject('rep-1', 'admin1')

    expect(report.status).toBe('resolved')
    expect(report.action).toBe('project_suspended')
    expect(report.resolvedBy).toBe('admin1')
    expect(await service.isProjectSuspended('proj-casino')).toBe(true)
    expect((await service.listReports('pending')).some((r) => r.id === 'rep-1')).toBe(false)

    const [mail] = readMailbox()
    expect(mail.to).toBe('carlos.perez@correo.com')
    expect(mail.body).toContain('Casino online para estudiantes')
  })

  it('descartar un reporte deja el proyecto visible', async () => {
    const report = await service.dismissReport('rep-2', 'admin1')
    expect(report.status).toBe('dismissed')
    expect(await service.isProjectSuspended('proj-ingresos')).toBe(false)
  })

  it('no permite gestionar dos veces el mismo reporte', async () => {
    await service.suspendProject('rep-1', 'admin1')
    await expect(service.dismissReport('rep-1', 'admin1')).rejects.toMatchObject({
      code: 'ALREADY_HANDLED',
    })
  })

  it('un reporte inexistente falla con REPORT_NOT_FOUND', async () => {
    const error = await service.suspendProject('no-existe', 'admin1').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ReportsError)
    expect((error as ReportsError).code).toBe('REPORT_NOT_FOUND')
  })

  describe('HU39 · Crear reporte de proyecto', () => {
    it('crea un reporte exitosamente y queda en estado pendiente', async () => {
      const rep = await service.createReport({
        projectId: 'proj-nuevo',
        projectTitle: 'Proyecto Sospechoso',
        reporterId: 'user-reporter',
        reporterName: 'Denunciante',
        cause: 'spam',
        reason: 'Tiene enlaces externos peligrosos.',
      })

      expect(rep.id).toBeDefined()
      expect(rep.status).toBe('pending')
      expect(rep.reason).toBe('Tiene enlaces externos peligrosos.')

      const pending = await service.listReports('pending')
      expect(pending.some((r) => r.id === rep.id)).toBe(true)
    })

    it('rechaza un reporte con motivo vacío con: «Proporcione un motivo»', async () => {
      await expect(
        service.createReport({
          projectId: 'proj-nuevo',
          projectTitle: 'Proyecto Sospechoso',
          reporterId: 'user-reporter',
          reporterName: 'Denunciante',
          cause: 'spam',
          reason: '   ',
        }),
      ).rejects.toThrow('Proporcione un motivo')
    })

    it('rechaza un reporte repetido con: «Ya registraste un reporte para esta publicación»', async () => {
      await service.createReport({
        projectId: 'proj-duplicado',
        projectTitle: 'Proyecto Duplicado',
        reporterId: 'user-reporter-dup',
        reporterName: 'Denunciante',
        cause: 'spam',
        reason: 'Primer reporte válido',
      })

      await expect(
        service.createReport({
          projectId: 'proj-duplicado',
          projectTitle: 'Proyecto Duplicado',
          reporterId: 'user-reporter-dup',
          reporterName: 'Denunciante',
          cause: 'inappropriate',
          reason: 'Segundo reporte para el mismo proyecto',
        }),
      ).rejects.toThrow('Ya registraste un reporte para esta publicación')
    })
  })
})
