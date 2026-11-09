export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  verified: boolean
  createdAt: string
}

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

export class AuthError extends Error {
  readonly code: AuthErrorCode
  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

/**
 * Contrato del servicio de autenticación. En el Sprint 1 se usa una
 * implementación simulada (localStorage); el backend implementará los
 * mismos casos de uso vía /auth/*.
 */
export interface AuthService {
  register(input: RegisterInput): Promise<User>
  verifyEmail(token: string): Promise<User>
  resendVerification(email: string): Promise<void>
  login(email: string, password: string): Promise<Session>
  logout(token: string): Promise<void>
  getSession(): Promise<Session | null>
  requestPasswordReset(email: string): Promise<void>
  resetPassword(token: string, newPassword: string): Promise<void>
}
