import { beforeEach, describe, expect, it } from 'vitest'
import { MockPlatformService } from '../services/platform'

describe('QA-A · Pruebas de aceptación de HU25–HU30 (Escenario feliz y alterno)', () => {
  let platform: MockPlatformService

  beforeEach(() => {
    platform = new MockPlatformService()
  })

  // --- HU25: Aceptación de Candidato para el Equipo (3 SP) ---
  describe('HU25 · Aceptación de Candidato para el Equipo', () => {
    it('Escenario feliz: el creador acepta al postulante, reduce la vacante en 1 e incorpora al equipo', () => {
      const projectBefore = platform.getProject('proj-1')!
      const roleBefore = projectBefore.roles.find((r) => r.id === 'role-ui')!
      expect(roleBefore.vacancies - roleBefore.filledVacancies).toBe(1)

      const result = platform.acceptApplication('app-1', 'user-creator-1')

      expect(result.application.status).toBe('Aceptada')
      expect(result.teamMember.userId).toBe('user-colab-2')
      expect(result.teamMember.roleId).toBe('role-ui')

      const projectAfter = platform.getProject('proj-1')!
      const roleAfter = projectAfter.roles.find((r) => r.id === 'role-ui')!
      expect(roleAfter.filledVacancies).toBe(1)
      expect(roleAfter.vacancies - roleAfter.filledVacancies).toBe(0)

      const team = platform.getTeamMembers('proj-1')
      expect(team.some((m) => m.userId === 'user-colab-2')).toBe(true)
    })

    it('Escenario alterno: bloquea la aceptación si no quedan vacantes disponibles', () => {
      platform.acceptApplication('app-1', 'user-creator-1')

      const project = platform.getProject('proj-1')!
      const role = project.roles.find((r) => r.id === 'role-ui')!
      const app2 = {
        id: 'app-extra',
        projectId: 'proj-1',
        projectTitle: project.title,
        roleId: role.id,
        roleTitle: role.title,
        applicantId: 'user-colab-99',
        applicantName: 'Candidato Tardío',
        applicantEmail: 'tardio@correo.com',
        coverNote: 'Quiero unirme',
        status: 'Pendiente' as const,
        appliedAt: new Date().toISOString(),
      }
      platform.applications.push(app2)

      expect(() => platform.acceptApplication('app-extra', 'user-creator-1')).toThrow(
        'No quedan vacantes disponibles.',
      )
    })

    it('Escenario alterno: un usuario que no es el creador no puede aceptar candidatos (403)', () => {
      expect(() => platform.acceptApplication('app-1', 'user-hacker')).toThrow(
        'Solo el creador del proyecto puede aceptar candidatos.',
      )
    })
  })

  // --- HU26: Rechazo de Candidato con Notificación (2 SP) ---
  describe('HU26 · Rechazo de Candidato con Notificación', () => {
    it('Escenario feliz: el creador rechaza la postulación pendiente y notifica al usuario', () => {
      const rejected = platform.rejectApplication('app-1', 'user-creator-1')

      expect(rejected.status).toBe('Rechazada')
      expect(rejected.resolvedAt).toBeDefined()

      const notifs = platform.getNotifications('user-colab-2')
      expect(notifs.some((n) => n.type === 'application_rejected')).toBe(true)
    })

    it('Escenario alterno: no se puede rechazar una postulación que ya no está pendiente', () => {
      platform.acceptApplication('app-1', 'user-creator-1')

      expect(() => platform.rejectApplication('app-1', 'user-creator-1')).toThrow(
        'Solo se pueden rechazar postulaciones pendientes.',
      )
    })
  })

  // --- HU27: Panel 'Mis Postulaciones' (Colaborador) (3 SP) ---
  describe('HU27 · Panel «Mis Postulaciones»', () => {
    it('Escenario feliz: lista las solicitudes del colaborador con su estado y rol', () => {
      const apps = platform.getMyApplications('user-colab-2')
      expect(apps).toHaveLength(1)
      expect(apps[0].projectTitle).toContain('EcoTrack')
      expect(apps[0].roleTitle).toBe('Diseñador UI/UX')
      expect(apps[0].status).toBe('Pendiente')
    })

    it('Escenario alterno: un usuario sin postulaciones recibe un arreglo vacío', () => {
      const apps = platform.getMyApplications('user-sin-postulaciones')
      expect(apps).toEqual([])
    })
  })

  // --- HU28: Visualización del Equipo del Proyecto (3 SP) ---
  describe('HU28 · Visualización del Equipo del Proyecto', () => {
    it('Escenario feliz: muestra al creador como Líder y a los colaboradores confirmados', () => {
      const team = platform.getTeamMembers('proj-1')
      expect(team.length).toBeGreaterThanOrEqual(2)

      const leader = team.find((m) => m.isLeader)
      expect(leader).toBeDefined()
      expect(leader?.roleTitle).toBe('Líder del proyecto')
      expect(leader?.userName).toBe('Carlos Mendonza')

      const member = team.find((m) => !m.isLeader)
      expect(member?.roleTitle).toBe('Frontend React Developer')
      expect(member?.userName).toBe('Sofía Martínez')
    })
  })

  // --- HU29: Salida Voluntaria del Equipo (2 SP) ---
  describe('HU29 · Salida Voluntaria del Equipo', () => {
    it('Escenario feliz: colaborador se retira y reabre su vacante para nuevos postulantes', () => {
      const projectBefore = platform.getProject('proj-1')!
      const roleBefore = projectBefore.roles.find((r) => r.id === 'role-dev')!
      expect(roleBefore.filledVacancies).toBe(1)

      const left = platform.leaveTeam('proj-1', 'user-colab-1')
      expect(left.status).toBe('Retirado')

      const roleAfter = platform.getProject('proj-1')!.roles.find((r) => r.id === 'role-dev')!
      expect(roleAfter.filledVacancies).toBe(0)

      const activeTeam = platform.getTeamMembers('proj-1')
      expect(activeTeam.some((m) => m.userId === 'user-colab-1')).toBe(false)
    })

    it('Escenario alterno: el creador/líder no puede abandonar el proyecto mediante salida voluntaria', () => {
      expect(() => platform.leaveTeam('proj-1', 'user-creator-1')).toThrow(
        'El líder del proyecto no puede abandonar el equipo sin transferir la propiedad.',
      )
    })
  })

  // --- HU30: Remoción de Integrante por el Creador (3 SP) ---
  describe('HU30 · Remoción de Integrante por el Creador', () => {
    it('Escenario feliz: el creador remueve a un colaborador y la vacante queda liberada', () => {
      const removed = platform.removeTeamMember('proj-1', 'user-colab-1', 'user-creator-1')
      expect(removed.status).toBe('Removido')

      const activeTeam = platform.getTeamMembers('proj-1')
      expect(activeTeam.some((m) => m.userId === 'user-colab-1')).toBe(false)
    })

    it('Escenario alterno: un colaborador regular no tiene permisos para remover compañeros (403)', () => {
      expect(() =>
        platform.removeTeamMember('proj-1', 'user-colab-1', 'user-colab-1'),
      ).toThrow('Solo el creador del proyecto puede remover integrantes.')
    })
  })
})
