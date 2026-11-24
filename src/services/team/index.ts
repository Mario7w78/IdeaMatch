import { API_BASE_URL } from '../http/apiClient'
import { httpTeamService } from './httpTeamService'
import { MockTeamService } from './mockTeamService'

export * from './types'
export { MockTeamService } from './mockTeamService'
export const teamService = API_BASE_URL ? httpTeamService : new MockTeamService()
