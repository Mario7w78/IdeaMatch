import { createContext, use } from 'react'
import type { AuthService, Session } from '../services/auth'

export interface AuthContextValue {
  session: Session | null
  loading: boolean
  service: AuthService
  login: (email: string, password: string) => Promise<Session>
  /** [HU02] Verifica el correo con el código y deja la sesión iniciada. */
  verifyEmailCode: (email: string, code: string) => Promise<Session>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
