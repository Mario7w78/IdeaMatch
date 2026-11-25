import { isApiEnabled } from '../http/apiClient'
import { httpTeamService } from './httpTeamService'
import { MockTeamService } from './mockTeamService'

export * from './types'
export { MockTeamService } from './mockTeamService'
export const teamService = isApiEnabled() ? httpTeamService : new MockTeamService()
