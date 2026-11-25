import { ApiError, apiRequest, tokenStore } from '../http/apiClient'
import { AuthError, type AuthService, type Session, type User } from './types'

/** Usuario tal como lo devuelve el backend. */
interface ApiUser {
  id: string | number
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
  createdAt: string
}

const toUser = (u: ApiUser): User => ({
  id: String(u.id),
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  // El backend no usa verificación por correo: la cuenta queda activa al registrarse.
  verified: true,
  createdAt: u.createdAt,
  role: u.isAdmin ? 'admin' : 'user',
})

function toAuthError(err: unknown): never {
  if (err instanceof ApiError) {
    if (err.code === 'EMAIL_TAKEN_OR_INVALID')
      throw new AuthError('EMAIL_TAKEN_OR_INVALID', 'El correo ingresado ya existe o no es válido')
    if (err.code === 'WEAK_PASSWORD')
      throw new AuthError('WEAK_PASSWORD', 'Usa al menos 8 caracteres, una mayúscula y un número.')
    if (err.code === 'INVALID_CREDENTIALS') throw new AuthError('INVALID_CREDENTIALS', 'Credenciales inválidas')
  }
  throw err
}

const unsupported = () =>
  new AuthError('INVALID_TOKEN', 'Esta función aún no está disponible en el servidor.')

/** Implementación contra el backend real (`/api/auth/*`). */
export function createHttpAuthService(): AuthService {
  return {
    async register(input) {
      try {
        // La cuenta queda activa, pero no se abre sesión: el usuario inicia sesión después.
        const res = await apiRequest<{ user: ApiUser }>('/auth/register', {
          method: 'POST',
          auth: false,
          body: input,
        })
        return toUser(res.user)
      } catch (err) {
        toAuthError(err)
      }
    },

    async login(email, password) {
      try {
        const res = await apiRequest<{ token: string; user: ApiUser }>('/auth/login', {
          method: 'POST',
          auth: false,
          body: { email: email.trim(), password },
        })
        tokenStore.set(res.token)
        return { token: res.token, user: toUser(res.user) }
      } catch (err) {
        toAuthError(err)
      }
    },

    async logout() {
      try {
        await apiRequest<void>('/auth/logout', { method: 'POST' })
      } catch {
        /* aunque el servidor falle, la sesión local se cierra */
      } finally {
        tokenStore.clear()
      }
    },

    async getSession(): Promise<Session | null> {
      const token = tokenStore.get()
      if (!token) return null
      try {
        const res = await apiRequest<{ user: ApiUser }>('/auth/me')
        return { token, user: toUser(res.user) }
      } catch (err) {
        // Solo una sesión rechazada la invalida; un fallo de red no cierra la sesión.
        if (err instanceof ApiError && err.status === 401) tokenStore.clear()
        return null
      }
    },

    async verifyEmail() {
      throw unsupported()
    },
    async resendVerification() {
      /* el backend no verifica correos */
    },
    async requestPasswordReset() {
      /* sin endpoint: respuesta genérica, como pide la HU4 */
    },
    async resetPassword() {
      throw unsupported()
    },
  }
}
