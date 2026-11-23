import { beforeEach, describe, expect, it } from 'vitest'
import { MockEmailPreferencesService } from './mockEmailPreferencesService'

describe('MockEmailPreferencesService (HU33)', () => {
  let service: MockEmailPreferencesService

  beforeEach(() => {
    localStorage.clear()
    service = new MockEmailPreferencesService()
  })

  it('un usuario nuevo recibe todos los correos por defecto', async () => {
    const prefs = await service.getPreferences('user1')
    expect(prefs.enabled).toBe(true)
    expect(Object.values(prefs.events).every(Boolean)).toBe(true)
  })

  it('guarda cambios sin tocar los demás eventos', async () => {
    await service.updatePreferences('user1', { events: { chat_messages: false } })
    const prefs = await service.getPreferences('user1')
    expect(prefs.events.chat_messages).toBe(false)
    expect(prefs.events.new_application).toBe(true)
  })

  it('shouldSendEmail respeta el evento y el interruptor general', async () => {
    await service.updatePreferences('user1', { events: { chat_messages: false } })
    expect(await service.shouldSendEmail('user1', 'chat_messages')).toBe(false)
    expect(await service.shouldSendEmail('user1', 'application_status')).toBe(true)

    await service.updatePreferences('user1', { enabled: false })
    expect(await service.shouldSendEmail('user1', 'application_status')).toBe(false)
  })

  it('las preferencias de un usuario no afectan a otro', async () => {
    await service.updatePreferences('user1', { enabled: false })
    expect((await service.getPreferences('user2')).enabled).toBe(true)
  })
})
