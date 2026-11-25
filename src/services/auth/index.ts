import { isApiEnabled } from '../http/apiClient'
import { createHttpAuthService } from './httpAuthService'
import { createMockAuthService } from './mockAuthService'

export * from './types'

/** Punto único de acceso: con `VITE_API_URL` usa el backend real; sin ella, el simulado. */
export const authService = isApiEnabled() ? createHttpAuthService() : createMockAuthService()
