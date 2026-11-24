import { createMockAuthService } from './mockAuthService'
import { API_BASE_URL } from '../http/apiClient'
import { httpAuthService } from './httpAuthService'

export * from './types'

/** Punto único de acceso: al integrar el backend se reemplaza por un cliente HTTP. */
export const authService = API_BASE_URL ? httpAuthService : createMockAuthService()
