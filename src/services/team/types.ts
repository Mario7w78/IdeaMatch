export interface TeamMember {
  userId: string
  name: string
  initials: string
  photoUrl?: string | null
  role: string
  roleId?: string | null
  isLeader: boolean
  joinedAt?: string
}

export interface TeamService {
  list(projectId: string): Promise<TeamMember[]>
  leave(projectId: string): Promise<void>
  remove(projectId: string, userId: string, reason: string): Promise<void>
}
