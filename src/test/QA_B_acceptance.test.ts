import { beforeEach, describe, expect, it } from 'vitest'
import { MockPlatformService } from '../services/platform'

describe('QA-B · Pruebas de aceptación de HU31–HU34', () => {
  let platform: MockPlatformService

  beforeEach(() => {
    platform = new MockPlatformService()
  })

  // --- HU31: Chat Grupal del Proyecto (Solo Aceptados) ---
  describe('HU31 · Chat Grupal del Proyecto (Solo Aceptados)', () => {
    it('permite a los integrantes del equipo leer y enviar mensajes en la sala privada', () => {
      const messagesBefore = platform.getChatMessages('proj-1', 'user-colab-1')
      expect(messagesBefore.length).toBeGreaterThan(0)

      const sent = platform.sendChatMessage({
        projectId: 'proj-1',
        senderId: 'user-colab-1',
        senderName: 'Sofía Martínez',
        content: 'Hola equipo, ya terminé la maqueta de la vista de métricas.',
      })

      expect(sent.id).toBeDefined()
      expect(sent.content).toContain('maqueta')

      const updatedMessages = platform.getChatMessages('proj-1', 'user-creator-1')
      expect(updatedMessages.some((m) => m.content.includes('maqueta'))).toBe(true)
    })
  })

  // --- HU32: Control de Acceso y Seguridad al Chat ---
  describe('HU32 · Control de Acceso y Seguridad al Chat', () => {
    it('bloquea el acceso a la sala de chat a usuarios que no forman parte del equipo (403)', () => {
      expect(() => platform.getChatMessages('proj-1', 'usuario-ajeno')).toThrow(
        '403: No formas parte de este equipo para acceder a la conversación.',
      )

      expect(() =>
        platform.sendChatMessage({
          projectId: 'proj-1',
          senderId: 'usuario-ajeno',
          senderName: 'Intruso',
          content: 'Mensaje no autorizado',
        }),
      ).toThrow('403: Ya no formas parte de este equipo.')
    })

    it('revoca de inmediato el acceso al chat a un integrante que se retira o es removido', () => {
      platform.leaveTeam('proj-1', 'user-colab-1')

      expect(() =>
        platform.sendChatMessage({
          projectId: 'proj-1',
          senderId: 'user-colab-1',
          senderName: 'Sofía Martínez',
          content: '¿Sigo teniendo acceso?',
        }),
      ).toThrow('403: Ya no formas parte de este equipo.')
    })
  })

  // --- HU33: Envíos de Archivos y Adjuntos en Chat ---
  describe('HU33 · Envíos de Archivos y Adjuntos en Chat', () => {
    it('permite compartir documentos, imágenes y enlaces de entrega en el chat', () => {
      const msgWithAttachment = platform.sendChatMessage({
        projectId: 'proj-1',
        senderId: 'user-creator-1',
        senderName: 'Carlos Mendonza',
        content: 'Adjunto el diagrama de arquitectura en PDF.',
        attachmentUrl: 'https://storage.ideamatch.com/docs/arquitectura.pdf',
        attachmentType: 'document',
        attachmentSizeBytes: 1024 * 500, // 500 KB
      })

      expect(msgWithAttachment.attachmentUrl).toBeDefined()
      expect(msgWithAttachment.attachmentType).toBe('document')
    })

    it('rechaza adjuntos que superan el límite permitido (5 MB)', () => {
      expect(() =>
        platform.sendChatMessage({
          projectId: 'proj-1',
          senderId: 'user-creator-1',
          senderName: 'Carlos Mendonza',
          content: 'Archivo pesado',
          attachmentUrl: 'https://storage.ideamatch.com/videos/demo.mp4',
          attachmentType: 'document',
          attachmentSizeBytes: 10 * 1024 * 1024, // 10 MB
        }),
      ).toThrow('El archivo adjunto supera el límite de 5 MB.')
    })
  })

  // --- HU34: Notificaciones In-App de Estado de Postulación ---
  describe('HU34 · Notificaciones In-App de Estado de Postulación', () => {
    it('genera una alerta in-app inmediata cuando el creador acepta la candidatura', () => {
      platform.acceptApplication('app-1', 'user-creator-1')

      const notifs = platform.getNotifications('user-colab-2')
      const acceptedNotif = notifs.find((n) => n.type === 'application_accepted')

      expect(acceptedNotif).toBeDefined()
      expect(acceptedNotif?.title).toBe('¡Postulación Aceptada!')
      expect(acceptedNotif?.message).toContain('EcoTrack')
      expect(acceptedNotif?.read).toBe(false)
    })

    it('genera una alerta in-app inmediata cuando el creador rechaza la candidatura', () => {
      platform.rejectApplication('app-1', 'user-creator-1')

      const notifs = platform.getNotifications('user-colab-2')
      const rejectedNotif = notifs.find((n) => n.type === 'application_rejected')

      expect(rejectedNotif).toBeDefined()
      expect(rejectedNotif?.title).toBe('Actualización sobre tu postulación')
      expect(rejectedNotif?.read).toBe(false)
    })
  })
})
