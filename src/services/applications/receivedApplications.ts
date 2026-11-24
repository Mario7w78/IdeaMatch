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
}

export const receivedApplicationsService: ReceivedApplicationsService = {
  list(projectId, roleId) {
    const query = new URLSearchParams({ status: 'pendiente', sort: 'match', page: '1', limit: '50' })
    if (roleId) query.set('roleId', roleId)
    return apiRequest<ReceivedApplications>(`/projects/${encodeURIComponent(projectId)}/applications?${query}`)
  },
}
