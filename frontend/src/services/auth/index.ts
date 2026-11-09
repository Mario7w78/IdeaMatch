import { createMockAuthService } from './mockAuthService'

export * from './types'

/** Punto único de acceso: al integrar el backend se reemplaza por un cliente HTTP. */
export const authService = createMockAuthService()
