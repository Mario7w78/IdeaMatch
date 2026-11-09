import { startTransition, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService as defaultService, type AuthService, type Session } from '../services/auth'
import { AuthContext } from './useAuth'

export function AuthProvider({
  children,
  service = defaultService,
}: {
  children: ReactNode
  service?: AuthService
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    service.getSession().then((s) => {
      if (active) {
        setSession(s)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [service])

  const login = useCallback(
    async (email: string, password: string) => {
      const s = await service.login(email, password)
      setSession(s)
      return s
    },
    [service],
  )

  const logout = useCallback(async () => {
    const current = session
    if (current) await service.logout(current.token)
    // React Router navega dentro de una transición; limpiar la sesión también
    // como transición evita que la guarda de rutas privadas redirija al login
    // antes de que termine la navegación hacia la página pública.
    startTransition(() => setSession(null))
  }, [service, session])

  const value = useMemo(
    () => ({ session, loading, service, login, logout }),
    [session, loading, service, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
