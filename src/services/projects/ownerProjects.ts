import { apiRequest } from '../http/apiClient'

export interface OwnerProject {
  id: string
  name: string
  status: string
  category?: string | { name: string }
  rolesCovered?: number
  rolesPending?: number
  pendingApplications?: number
}

/** HU25-FE: IDs reales del creador, independientes del catálogo mock. */
export const ownerProjectsService = {
  list: () => apiRequest<OwnerProject[]>('/me/projects'),
}
