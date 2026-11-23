import { beforeEach, describe, expect, it } from 'vitest'
import { MockPlatformService } from '../services/platform'
import { clearMailbox, readMailbox } from '../services/mailbox'

describe('QA-C · Pruebas de aceptación de HU35–HU37', () => {
  let platform: MockPlatformService

  beforeEach(() => {
    localStorage.clear()
    clearMailbox()
    platform = new MockPlatformService()
  })

  // --- HU35: Notificaciones In-App por Nueva Postulación (Creador) ---
  describe('HU35 · Notificaciones In-App por Nueva Postulación (Creador)', () => {
    it('notifica al creador de inmediato cuando un nuevo candidato postula a su proyecto', () => {
      platform.applyToRole({
        projectId: 'proj-1',
        roleId: 'role-dev',
        applicantId: 'user-postulante-nuevo',
        applicantName: 'Mariana Ruiz',
        applicantEmail: 'mariana@correo.com',
        coverNote: 'Experta en React y diseño accesible.',
      })

      const creatorNotifs = platform.getNotifications('user-creator-1')
      const newPostulationNotif = creatorNotifs.find((n) => n.type === 'application_submitted')

      expect(newPostulationNotif).toBeDefined()
      expect(newPostulationNotif?.title).toBe('Nueva postulación recibida')
      expect(newPostulationNotif?.message).toContain('Mariana Ruiz')
      expect(newPostulationNotif?.message).toContain('Frontend React Developer')
    })
  })

  // --- HU36: Notificaciones por Correo Electrónico ---
  describe('HU36 · Notificaciones por Correo Electrónico', () => {
    it('despacha un correo transaccional al buzón cuando la postulación es aceptada', () => {
      platform.acceptApplication('app-1', 'user-creator-1')

      const mails = readMailbox()
      expect(mails.length).toBeGreaterThan(0)

      const acceptMail = mails.find((m) => m.to === 'lucia@correo.com')
      expect(acceptMail).toBeDefined()
      expect(acceptMail?.subject).toContain('¡Fuiste aceptado en EcoTrack')
      expect(acceptMail?.link).toContain('/app/mensajes')
    })
  })

  // --- HU37: Centro de Control de Notificaciones ---
  describe('HU37 · Centro de Control de Notificaciones', () => {
    it('permite consultar notificaciones, marcarlas como leídas y marcar todas como leídas', () => {
      platform.applyToRole({
        projectId: 'proj-1',
        roleId: 'role-dev',
        applicantId: 'user-test-1',
        applicantName: 'Postulante 1',
        applicantEmail: 'p1@correo.com',
        coverNote: 'Nota 1',
      })

      const notifsBefore = platform.getNotifications('user-creator-1')
      expect(notifsBefore.length).toBeGreaterThan(0)
      expect(notifsBefore[0].read).toBe(false)

      platform.markNotificationAsRead(notifsBefore[0].id)
      expect(platform.getNotifications('user-creator-1')[0].read).toBe(true)

      platform.markAllNotificationsAsRead('user-creator-1')
      const allRead = platform.getNotifications('user-creator-1').every((n) => n.read)
      expect(allRead).toBe(true)
    })
  })
})
