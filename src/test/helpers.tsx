import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../App'
import { AuthProvider } from '../context/AuthContext'
import type { AuthService } from '../services/auth'
import { createMockAuthService } from '../services/auth/mockAuthService'

/** Servicio de auth sin retardos para pruebas de pantalla. */
export const testAuth = () => createMockAuthService({ delayMs: 0, origin: 'http://localhost' })

/** Inicia sesión con una cuenta semilla y devuelve el servicio de auth. */
export async function loginAs(email: string): Promise<AuthService> {
  const auth = testAuth()
  await auth.login(email, 'Password123')
  return auth
}

export function renderAt(path: string, authService: AuthService) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider service={authService}>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
}
