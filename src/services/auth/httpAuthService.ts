import { apiRequest, ApiError, readApiSession, saveApiSession } from '../http/apiClient'
import { AuthError, type AuthService, type Session, type User } from './types'

type ApiUser = Omit<User, 'verified' | 'role'> & { isAdmin?: boolean }
const mapUser = (user: ApiUser): User => ({ ...user, verified: true, role: user.isAdmin ? 'admin' : 'user' })

function authError(error: unknown): AuthError {
  if (error instanceof ApiError) return new AuthError(
    error.code as AuthError['code'], error.message,
  )
  return new AuthError('INVALID_TOKEN', 'No se pudo completar la solicitud.')
}

const unavailable = async (): Promise<never> => {
  throw new AuthError('INVALID_TOKEN', 'Esta función aún no está disponible en el backend.')
}

export const httpAuthService: AuthService = {
  async register(input) {
    try {
      const result = await apiRequest<{ token: string; user: ApiUser }>('/auth/register', {
        method: 'POST', body: JSON.stringify(input),
      })
      // El registro devuelve sesión activa en el backend.
      saveApiSession({ token: result.token, user: mapUser(result.user) })
      return mapUser(result.user)
    } catch (error) { throw authError(error) }
  },
  async login(email, password) {
    try {
      const result = await apiRequest<{ token: string; user: ApiUser }>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      })
      const session: Session = { token: result.token, user: mapUser(result.user) }
      saveApiSession(session)
      return session
    } catch (error) { throw authError(error) }
  },
  async getSession() {
    const stored = readApiSession() as Session | null
    if (!stored) return null
    try {
      const result = await apiRequest<{ user: ApiUser }>('/auth/me')
      const session = { token: stored.token, user: mapUser(result.user) }
      saveApiSession(session)
      return session
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) saveApiSession(null)
      if (error instanceof ApiError && error.status === 401) return null
      // Un fallo de red transitorio no destruye la sesión almacenada.
      return stored
    }
  },
  async logout() {
    try { await apiRequest<void>('/auth/logout', { method: 'POST' }) }
    finally { saveApiSession(null) }
  },
  verifyEmail: unavailable,
  resendVerification: unavailable,
  requestPasswordReset: unavailable,
  resetPassword: unavailable,
}
