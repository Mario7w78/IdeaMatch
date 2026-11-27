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

/** El backend solo entrega sesión a cuentas ya verificadas; el registro indica si falta verificar. */
const toUser = (u: ApiUser, verified = true): User => ({
  id: String(u.id),
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  verified,
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
    // [HU02] Cuenta pendiente: la UI ofrece ingresar el código enviado al correo.
    if (err.code === 'EMAIL_NOT_VERIFIED')
      throw new AuthError('EMAIL_NOT_VERIFIED', 'Tu cuenta aún no está verificada. Revisa tu correo e ingresa el código.')
    if (err.code === 'ACCOUNT_DISABLED') throw new AuthError('ACCOUNT_DISABLED', err.message)
    if (err.code === 'INVALID_CODE') {
      const left = (err.details as { attemptsLeft?: unknown } | undefined)?.attemptsLeft
      throw new AuthError('INVALID_CODE', 'El código no es válido o ya venció.', typeof left === 'number' ? left : undefined)
    }
    if (err.code === 'VALIDATION') throw new AuthError('INVALID_CODE', 'El código debe tener 6 dígitos.')
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
        // [HU01] La cuenta queda pendiente y el backend envía un código al correo; no abre sesión.
        const res = await apiRequest<{ user: ApiUser; verificationRequired?: boolean }>('/auth/register', {
          method: 'POST',
          auth: false,
          body: input,
        })
        return toUser(res.user, !res.verificationRequired)
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
      // El backend verifica con código, no con enlace: ver verifyEmailCode.
      throw unsupported()
    },

    async verifyEmailCode(email, code) {
      try {
        const res = await apiRequest<{ token: string; user: ApiUser }>('/auth/verify-email', {
          method: 'POST',
          auth: false,
          body: { email: email.trim(), code: code.trim() },
        })
        tokenStore.set(res.token)
        return { token: res.token, user: toUser(res.user) }
      } catch (err) {
        toAuthError(err)
      }
    },

    async resendVerification(email) {
      // 204 exista o no la cuenta; solo falla si el servicio de correo cae (502 EMAIL_SEND_FAILED).
      await apiRequest<void>('/auth/resend-verification', {
        method: 'POST',
        auth: false,
        body: { email: email.trim() },
      })
    },
    async requestPasswordReset(email) {
      // [HU04] 204 exista o no la cuenta (no revela qué correos están registrados).
      await apiRequest<void>('/auth/forgot-password', {
        method: 'POST',
        auth: false,
        body: { email: email.trim() },
      })
    },

    async resetPassword() {
      // El backend restablece con código, no con enlace: ver resetPasswordWithCode.
      throw unsupported()
    },

    async resetPasswordWithCode(email, code, newPassword) {
      try {
        await apiRequest<void>('/auth/reset-password', {
          method: 'POST',
          auth: false,
          body: { email: email.trim(), code: code.trim(), newPassword },
        })
      } catch (err) {
        toAuthError(err)
      }
    },
  }
}
