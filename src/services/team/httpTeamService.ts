import { apiRequest } from '../http/apiClient'
import type { TeamMember, TeamService } from './types'

/** HU28–HU30: el backend valida pertenencia, propietario y libera vacantes. */
export const httpTeamService: TeamService = {
  list: (projectId) => apiRequest<TeamMember[]>(`/projects/${encodeURIComponent(projectId)}/team`),
  leave: (projectId) => apiRequest<void>(`/projects/${encodeURIComponent(projectId)}/leave`, { method: 'POST' }),
  remove: (projectId, userId, reason) => apiRequest<void>(
    `/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(userId)}`,
    { method: 'DELETE', body: JSON.stringify({ reason: reason.trim() }) },
  ),
}
