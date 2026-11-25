import { isApiEnabled } from '../http/apiClient'
import { HttpCategoriesService } from './httpCategoriesService'
import { MockCategoriesService } from './mockCategoriesService'
import type { CategoriesService } from './types'

export * from './types'
export { MockCategoriesService }

/** Punto único de acceso: con `VITE_API_URL` usa el backend real; sin ella, el simulado. */
export const categoriesService: CategoriesService = isApiEnabled()
  ? new HttpCategoriesService()
  : new MockCategoriesService()
