export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  verified: boolean
  createdAt: string
  /** Ausente en cuentas antiguas: se trata como 'user'. */
  role?: UserRole
}

export const isAdmin = (user?: User | null): boolean => user?.role === 'admin'

export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface Session {
  token: string
  user: User
}

/** Error de negocio con un código estable para que la UI decida qué mostrar. */
export type AuthErrorCode =
  | 'EMAIL_TAKEN_OR_INVALID'
  | 'WEAK_PASSWORD'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_TOKEN'
  | 'INVALID_CODE'
  | 'ACCOUNT_DISABLED'

export class AuthError extends Error {
  readonly code: AuthErrorCode
  /** Solo con INVALID_CODE: intentos que quedan antes de que el código se invalide. */
  readonly attemptsLeft?: number
  constructor(code: AuthErrorCode, message: string, attemptsLeft?: number) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.attemptsLeft = attemptsLeft
  }
}

/** [HU02] El correo se confirma con un código de 6 dígitos (como el backend). */
export const VERIFY_CODE_LENGTH = 6
export const isVerifyCode = (value: string): boolean => /^\d{6}$/.test(value.trim())

/**
 * Contrato del servicio de autenticación. En el Sprint 1 se usa una
 * implementación simulada (localStorage); el backend implementará los
 * mismos casos de uso vía /auth/*.
 */
export interface AuthService {
  register(input: RegisterInput): Promise<User>
  /** Verificación por enlace (solo el servicio simulado envía enlaces). */
  verifyEmail(token: string): Promise<User>
  /** [HU02] Confirma el correo con el código recibido y deja la sesión iniciada. */
  verifyEmailCode(email: string, code: string): Promise<Session>
  resendVerification(email: string): Promise<void>
  login(email: string, password: string): Promise<Session>
  logout(token: string): Promise<void>
  getSession(): Promise<Session | null>
  requestPasswordReset(email: string): Promise<void>
  /** Restablecimiento por enlace (solo el servicio simulado envía enlaces). */
  resetPassword(token: string, newPassword: string): Promise<void>
  /** [HU04] Cambia la contraseña con el código de 6 dígitos enviado al correo. */
  resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<void>
}
