import { isApiEnabled } from '../http/apiClient'
import { HttpReportsService } from './httpReportsService'
import { MockReportsService, reportsService as mockReportsService } from './mockReportsService'
import type { ReportsService } from './types'

export * from './types'
export { MockReportsService }

/** Punto único de acceso: con `VITE_API_URL` usa el backend real; sin ella, el simulado. */
export const reportsService: ReportsService = isApiEnabled() ? new HttpReportsService() : mockReportsService
