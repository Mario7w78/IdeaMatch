import { beforeEach, describe, expect, it } from 'vitest'
import { applicationService } from './mockApplicationService'

describe('MockApplicationService (Criterios de Aceptación HU21, HU22, HU23, HU24)', () => {
  beforeEach(() => {
    localStorage.clear()
    applicationService.reset()
  })

  describe('HU24: Panel Mis Postulaciones', () => {
    it('retorna las postulaciones y métricas para usuario con historial (Mariana Soto)', async () => {
      const apps = await applicationService.getMyApplications('usr-mariana')
      expect(apps.length).toBeGreaterThanOrEqual(4)

      const stats = await applicationService.getApplicationStats('usr-mariana')
      expect(stats.total).toBe(6)
      expect(stats.pending).toBe(2)
      expect(stats.accepted).toBe(1)
      expect(stats.finalized).toBe(3)
    })

    it('retorna arreglo vacío para usuario sin postulaciones (Daniel Torres)', async () => {
      const apps = await applicationService.getMyApplications('usr-daniel')
      expect(apps).toEqual([])

      const stats = await applicationService.getApplicationStats('usr-daniel')
      expect(stats.total).toBe(0)
      expect(stats.pending).toBe(0)
      expect(stats.accepted).toBe(0)
      expect(stats.finalized).toBe(0)
    })
  })

  describe('HU21: Enviar Postulación a un Rol Específico', () => {
    it('Caso Feliz: envía postulación con nota válida y pasa a estado PENDING', async () => {
      const newApp = await applicationService.applyToRole('usr-daniel', {
        projectId: 'proj-neurobloom',
        roleId: 'role-nb-designer',
        note: 'Hola, tengo alta experiencia diseñando interfaces y me gustaría unirme.',
      })

      expect(newApp.id).toBeDefined()
      expect(newApp.status).toBe('PENDING')
      expect(newApp.projectTitle).toBe('NeuroBloom')
      expect(newApp.roleName).toBe('Product Designer')

      // Verificar que ahora se liste en sus postulaciones
      const apps = await applicationService.getMyApplications('usr-daniel')
      expect(apps.some((a) => a.id === newApp.id)).toBe(true)
    })

    it('Caso Alterno: bloquea solicitud si el rol no tiene vacantes disponibles', async () => {
      await expect(
        applicationService.applyToRole('usr-daniel', {
          projectId: 'proj-neurobloom',
          roleId: 'role-nb-exhausted', // vacantes: 0
          note: 'Deseo postular a este rol sin vacantes.',
        }),
      ).rejects.toThrow('El rol seleccionado ya ha cubierto todas sus vacantes.')
    })

    it('Caso Alterno: bloquea solicitud si el proyecto no está Abierto', async () => {
      await expect(
        applicationService.applyToRole('usr-daniel', {
          projectId: 'proj-aurora-closed', // status: 'CLOSED'
          roleId: 'role-aurora-creative',
          note: 'Deseo postular.',
        }),
      ).rejects.toThrow('No se pueden enviar postulaciones a proyectos que no estén Abiertos.')
    })
  })

  describe('HU22: Restricción de Múltiples Postulaciones', () => {
    it('Caso Feliz: hasAppliedToProject devuelve false si no ha postulado', async () => {
      const hasApplied = await applicationService.hasAppliedToProject('usr-daniel', 'proj-neurobloom')
      expect(hasApplied).toBe(false)
    })

    it('Caso Alterno: bloquea postulación duplicada al mismo proyecto', async () => {
      // Primera postulación exitosa
      await applicationService.applyToRole('usr-daniel', {
        projectId: 'proj-neurobloom',
        roleId: 'role-nb-designer',
        note: 'Primera postulación válida.',
      })

      // Segunda postulación al mismo proyecto (incluso a otro rol) debe ser bloqueada
      await expect(
        applicationService.applyToRole('usr-daniel', {
          projectId: 'proj-neurobloom',
          roleId: 'role-nb-frontend',
          note: 'Segunda postulación que debe rebotar.',
        }),
      ).rejects.toThrow('Ya cuentas con una postulación registrada para este proyecto.')
    })
  })

  describe('HU23: Cancelación de Postulación Enviada', () => {
    it('Caso Feliz: cancela una postulación en estado PENDING y pasa a CANCELLED', async () => {
      const app = await applicationService.applyToRole('usr-daniel', {
        projectId: 'proj-neurobloom',
        roleId: 'role-nb-designer',
        note: 'Postulación a cancelar.',
      })

      const cancelled = await applicationService.cancelApplication('usr-daniel', app.id)
      expect(cancelled.status).toBe('CANCELLED')

      const apps = await applicationService.getMyApplications('usr-daniel')
      const target = apps.find((a) => a.id === app.id)
      expect(target?.status).toBe('CANCELLED')
    })

    it('Caso Alterno: no permite cancelar una postulación que ya ha sido procesada (ACCEPTED)', async () => {
      // app-mb-3 está en estado ACCEPTED en los datos semilla
      await expect(
        applicationService.cancelApplication('usr-mariana', 'app-mb-3'),
      ).rejects.toThrow('No se puede cancelar una postulación que ya ha sido procesada por el creador.')
    })
  })
})
