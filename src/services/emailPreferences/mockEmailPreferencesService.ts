import {
  type EmailEvent,
  type EmailPreferences,
  type EmailPreferencesService,
  type UpdateEmailPreferencesInput,
} from './types'

const STORAGE_KEY = 'ideamatch_mock_email_preferences_v1'

type Store = Record<string, EmailPreferences>

const defaults = (userId: string): EmailPreferences => ({
  userId,
  enabled: true,
  events: {
    new_application: true,
    application_status: true,
    chat_messages: true,
    project_updates: true,
  },
  updatedAt: new Date(0).toISOString(),
})

/** Implementación simulada (localStorage) de las preferencias de correo. */
export class MockEmailPreferencesService implements EmailPreferencesService {
  private load(): Store {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Store) : {}
    } catch {
      return {}
    }
  }

  private save(store: Store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }

  async getPreferences(userId: string): Promise<EmailPreferences> {
    const saved = this.load()[userId]
    const base = defaults(userId)
    return saved ? { ...base, ...saved, events: { ...base.events, ...saved.events } } : base
  }

  async updatePreferences(
    userId: string,
    input: UpdateEmailPreferencesInput,
  ): Promise<EmailPreferences> {
    const current = await this.getPreferences(userId)
    const updated: EmailPreferences = {
      ...current,
      enabled: input.enabled ?? current.enabled,
      events: { ...current.events, ...input.events },
      updatedAt: new Date().toISOString(),
    }
    const store = this.load()
    store[userId] = updated
    this.save(store)
    return updated
  }

  async shouldSendEmail(userId: string, event: EmailEvent): Promise<boolean> {
    const prefs = await this.getPreferences(userId)
    return prefs.enabled && prefs.events[event]
  }

  /** Método auxiliar para pruebas: restablecer los datos. */
  reset(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const emailPreferencesService = new MockEmailPreferencesService()
