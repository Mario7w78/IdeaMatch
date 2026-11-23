import { beforeEach, describe, expect, it } from 'vitest'
import { MockPlatformService } from '../services/platform'

describe('TEST-API · Pruebas del backend: Permisos (403), Transacción Atómica, Acceso a Chat y Webhooks', () => {
  let platform: MockPlatformService

  beforeEach(() => {
    platform = new MockPlatformService()
  })

  // 1. Control de accesos y permisos por rol (403 Forbidden)
  describe('Permisos y Autorización (403 Forbidden)', () => {
    it('retorna 403 cuando un usuario intenta editar un proyecto que no le pertenece', () => {
      expect(() =>
        platform.updateProject('proj-1', 'usuario-atacante', {
          title: 'Proyecto Hackeado',
        }),
      ).toThrow('No tienes permisos para editar este proyecto.')
    })

    it('retorna 403 cuando un usuario que no es el creador intenta aceptar o rechazar postulantes', () => {
      expect(() => platform.acceptApplication('app-1', 'colaborador-no-creador')).toThrow(
        'Solo el creador del proyecto puede aceptar candidatos.',
      )

      expect(() => platform.rejectApplication('app-1', 'colaborador-no-creador')).toThrow(
        'Solo el creador del proyecto puede rechazar candidatos.',
      )
    })

    it('retorna 403 cuando un colaborador intenta expulsar a otro integrante o al líder', () => {
      expect(() =>
        platform.removeTeamMember('proj-1', 'user-colab-1', 'user-colab-1'),
      ).toThrow('Solo el creador del proyecto puede remover integrantes.')
    })
  })

  // 2. Transacción atómica de aceptación (-1 vacante y alta en equipo)
  describe('Transacción Atómica de Aceptación', () => {
    it('garantiza la atomicidad: descuenta vacante, cambia estado y da de alta al integrante', () => {
      const initialVacancies = platform.getProject('proj-1')!.roles.find((r) => r.id === 'role-ui')!.filledVacancies
      const initialTeamCount = platform.getTeamMembers('proj-1').length

      const result = platform.acceptApplication('app-1', 'user-creator-1')

      expect(result.application.status).toBe('Aceptada')
      expect(result.teamMember.status).toBe('Activo')

      const updatedVacancies = platform.getProject('proj-1')!.roles.find((r) => r.id === 'role-ui')!.filledVacancies
      expect(updatedVacancies).toBe(initialVacancies + 1)

      const updatedTeam = platform.getTeamMembers('proj-1')
      expect(updatedTeam).toHaveLength(initialTeamCount + 1)
    })

    it('no realiza cambios parciales si la postulación ya no tiene vacantes disponibles', () => {
      platform.acceptApplication('app-1', 'user-creator-1')

      const teamCountBefore = platform.getTeamMembers('proj-1').length

      const fakeApp = {
        id: 'app-concurrente',
        projectId: 'proj-1',
        projectTitle: 'EcoTrack',
        roleId: 'role-ui',
        roleTitle: 'Diseñador UI/UX',
        applicantId: 'user-concurrente',
        applicantName: 'Postulante Concurrente',
        applicantEmail: 'concurrente@correo.com',
        coverNote: 'Prueba',
        status: 'Pendiente' as const,
        appliedAt: new Date().toISOString(),
      }
      platform.applications.push(fakeApp)

      expect(() => platform.acceptApplication('app-concurrente', 'user-creator-1')).toThrow(
        'No quedan vacantes disponibles.',
      )

      expect(platform.getTeamMembers('proj-1')).toHaveLength(teamCountBefore)
      expect(fakeApp.status).toBe('Pendiente')
    })
  })

  // 3. Acceso al chat y seguridad de sala
  describe('Seguridad y Acceso al Chat Grupal', () => {
    it('valida membresía y bloquea peticiones de lectura a usuarios no miembros (403)', () => {
      expect(() => platform.getChatMessages('proj-1', 'usuario-externo')).toThrow(
        '403: No formas parte de este equipo para acceder a la conversación.',
      )
    })

    it('bloquea el envío de mensajes a usuarios que no integran el equipo (403)', () => {
      expect(() =>
        platform.sendChatMessage({
          projectId: 'proj-1',
          senderId: 'usuario-externo',
          senderName: 'Atacante',
          content: 'Mensaje no autorizado',
        }),
      ).toThrow('403: Ya no formas parte de este equipo.')
    })
  })

  // 4. Webhooks de plataformas externas
  describe('Autenticación y Recepción de Webhooks', () => {
    it('valida la firma secreta de webhooks entrantes y los almacena', () => {
      const response = platform.receiveWebhook(
        'figma',
        { event: 'file_updated', fileKey: 'abc' },
        'valid-webhook-secret',
      )
      expect(response.success).toBe(true)
      expect(response.eventId).toBeDefined()
    })

    it('rechaza con 403 peticiones de webhooks con cabecera de autenticación incorrecta', () => {
      expect(() =>
        platform.receiveWebhook(
          'figma',
          { event: 'file_updated' },
          'secreto-incorrecto',
        ),
      ).toThrow('Firma o secreto de webhook inválido.')
    })
  })
})
