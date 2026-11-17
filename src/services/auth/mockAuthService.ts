import { isValidEmail, isValidPassword } from '../../lib/validation'
import { sendMail } from '../mailbox'
import { AuthError, type AuthService, type RegisterInput, type Session, type User } from './types'

/**
 * Implementación simulada del servicio de autenticación (solo frontend).
 * Persiste en localStorage y "envía" correos al buzón de pruebas.
 * NOTA: el hash SHA-256 es solo para no guardar texto plano en el navegador;
 * el backend debe usar bcrypt/argon2 (RNF32).
 */

interface StoredUser extends User {
  passwordHash: string
}

type TokenType = 'verify' | 'reset'

interface StoredToken {
  token: string
  type: TokenType
  userId: string
  expiresAt: number
  used: boolean
}

interface StoredSession {
  token: string
  userId: string
}

const KEYS = {
  users: 'im.users',
  tokens: 'im.tokens',
  session: 'im.session',
} as const

export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000
export const RESET_TTL_MS = 60 * 60 * 1000

export interface MockAuthOptions {
  storage?: Storage
  now?: () => number
  delayMs?: number
  origin?: string
}

const genericInvalid = () => new AuthError('INVALID_CREDENTIALS', 'Credenciales inválidas')
const invalidToken = (type: TokenType) =>
  new AuthError(
    'INVALID_TOKEN',
    type === 'verify'
      ? 'Enlace de activación inválido o expirado'
      : 'El enlace para restablecer la contraseña es inválido o expiró',
  )

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function publicUser(u: StoredUser): User {
  const { passwordHash: _omit, ...rest } = u
  void _omit
  return rest
}

export function createMockAuthService(opts: MockAuthOptions = {}): AuthService {
  const storage = opts.storage ?? window.localStorage
  const now = opts.now ?? (() => Date.now())
  const delayMs = opts.delayMs ?? 350
  const origin = opts.origin ?? window.location.origin

  const read = <T>(key: string, fallback: T): T => {
    try {
      const raw = storage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  }
  const write = (key: string, value: unknown) => storage.setItem(key, JSON.stringify(value))
  const wait = () => (delayMs > 0 ? new Promise((r) => setTimeout(r, delayMs)) : Promise.resolve())

  const users = () => read<StoredUser[]>(KEYS.users, [])
  const tokens = () => read<StoredToken[]>(KEYS.tokens, [])
  const findByEmail = (email: string) =>
    users().find((u) => u.email === email.trim().toLowerCase())

  function issueToken(type: TokenType, userId: string): string {
    const ttl = type === 'verify' ? VERIFY_TTL_MS : RESET_TTL_MS
    // Un token nuevo invalida los anteriores del mismo tipo.
    const rest = tokens().filter((t) => !(t.userId === userId && t.type === type))
    const token = randomToken()
    write(KEYS.tokens, [...rest, { token, type, userId, expiresAt: now() + ttl, used: false }])
    return token
  }

  function consumeToken(token: string, type: TokenType): StoredToken {
    const all = tokens()
    const found = all.find((t) => t.token === token && t.type === type)
    if (!found || found.used || found.expiresAt < now()) throw invalidToken(type)
    write(
      KEYS.tokens,
      all.map((t) => (t.token === token ? { ...t, used: true } : t)),
    )
    return found
  }

  function sendVerification(user: StoredUser) {
    const token = issueToken('verify', user.id)
    sendMail({
      to: user.email,
      subject: 'Activa tu cuenta de IdeaMatch',
      body: `Hola ${user.firstName}, confirma tu correo para empezar. El enlace vence en 24 horas.`,
      link: `${origin}/verificar/${token}`,
    })
  }

  function updateUser(id: string, patch: Partial<StoredUser>) {
    write(
      KEYS.users,
      users().map((u) => (u.id === id ? { ...u, ...patch } : u)),
    )
  }

  return {
    async register(input: RegisterInput) {
      await wait()
      const email = input.email.trim().toLowerCase()
      if (!isValidEmail(email) || findByEmail(email)) {
        throw new AuthError('EMAIL_TAKEN_OR_INVALID', 'El correo ingresado ya existe o no es válido')
      }
      if (!isValidPassword(input.password)) {
        throw new AuthError('WEAK_PASSWORD', 'Usa al menos 8 caracteres, una mayúscula y un número.')
      }
      const user: StoredUser = {
        id: crypto.randomUUID(),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email,
        verified: false,
        createdAt: new Date(now()).toISOString(),
        passwordHash: await sha256(input.password),
      }
      write(KEYS.users, [...users(), user])
      sendVerification(user)
      return publicUser(user)
    },

    async verifyEmail(token) {
      await wait()
      const t = consumeToken(token, 'verify')
      updateUser(t.userId, { verified: true })
      const user = users().find((u) => u.id === t.userId)
      if (!user) throw invalidToken('verify')
      return publicUser(user)
    },

    async resendVerification(email) {
      await wait()
      const user = findByEmail(email)
      // Respuesta idéntica exista o no la cuenta.
      if (user && !user.verified) sendVerification(user)
    },

    async login(email, password) {
      await wait()
      const user = findByEmail(email)
      if (!user || user.passwordHash !== (await sha256(password))) throw genericInvalid()
      if (!user.verified) {
        throw new AuthError(
          'EMAIL_NOT_VERIFIED',
          'Tu cuenta aún no está verificada. Revisa tu correo para activarla.',
        )
      }
      const session: StoredSession = { token: randomToken(), userId: user.id }
      write(KEYS.session, session)
      return { token: session.token, user: publicUser(user) }
    },

    async logout(token) {
      await wait()
      const current = read<StoredSession | null>(KEYS.session, null)
      if (current && current.token === token) storage.removeItem(KEYS.session)
    },

    async getSession(): Promise<Session | null> {
      const current = read<StoredSession | null>(KEYS.session, null)
      if (!current) return null
      const user = users().find((u) => u.id === current.userId)
      if (!user) {
        storage.removeItem(KEYS.session)
        return null
      }
      return { token: current.token, user: publicUser(user) }
    },

    async requestPasswordReset(email) {
      await wait()
      const user = findByEmail(email)
      if (!user) return // Mensaje genérico en la UI: no se revela si la cuenta existe.
      const token = issueToken('reset', user.id)
      sendMail({
        to: user.email,
        subject: 'Restablece tu contraseña de IdeaMatch',
        body: 'Recibimos una solicitud para cambiar tu contraseña. El enlace vence en 1 hora.',
        link: `${origin}/restablecer/${token}`,
      })
    },

    async resetPassword(token, newPassword) {
      await wait()
      if (!isValidPassword(newPassword)) {
        throw new AuthError('WEAK_PASSWORD', 'Usa al menos 8 caracteres, una mayúscula y un número.')
      }
      const t = consumeToken(token, 'reset')
      updateUser(t.userId, { passwordHash: await sha256(newPassword) })
      // Cerrar cualquier sesión abierta del usuario.
      const current = read<StoredSession | null>(KEYS.session, null)
      if (current?.userId === t.userId) storage.removeItem(KEYS.session)
    },
  }
}
