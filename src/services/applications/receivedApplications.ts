import { apiRequest } from '../http/apiClient'

export interface ApplicantCard {
  id: string
  roleId: string
  role: string
  status: string
  isNew: boolean
  matchPercent: number
  note: string
  createdAt: string
  applicant: {
    id: string
    name: string
    initials: string
    headline?: string
    location?: string
    skills: string[]
    links?: Record<string, string>
  }
}

export interface ReceivedApplications {
  roleCounts: { roleId: string; name: string; count: number }[]
  total: number
  vacancies: number
  page: number
  limit: number
  items: ApplicantCard[]
}

export interface ReceivedApplicationsService {
  list(projectId: string, roleId?: string): Promise<ReceivedApplications>
  accept(applicationId: string): Promise<unknown>
  reject(applicationId: string): Promise<unknown>
}

export const receivedApplicationsService: ReceivedApplicationsService = {
  list(projectId, roleId) {
    return apiRequest<ReceivedApplications>(`/projects/${encodeURIComponent(projectId)}/applications`, {
      query: { status: 'pendiente', sort: 'match', page: 1, limit: 50, roleId },
    })
  },
  accept: (id) => apiRequest(`/applications/${encodeURIComponent(id)}/accept`, { method: 'POST' }),
  reject: (id) => apiRequest(`/applications/${encodeURIComponent(id)}/reject`, { method: 'POST' }),
}
