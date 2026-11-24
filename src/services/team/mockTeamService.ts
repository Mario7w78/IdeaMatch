import type { TeamMember, TeamService } from './types'

/** Mock aislado para aceptación sin modificar datos de proyectos de otros módulos. */
export class MockTeamService implements TeamService {
  private readonly members: Record<string, TeamMember[]>
  private readonly currentUserId: string

  constructor(members: Record<string, TeamMember[]> = {}, currentUserId = '') {
    this.members = members
    this.currentUserId = currentUserId
  }

  async list(projectId: string): Promise<TeamMember[]> {
    return [...(this.members[projectId] ?? [])]
  }

  async leave(projectId: string): Promise<void> {
    const member = this.members[projectId]?.find((item) => item.userId === this.currentUserId)
    if (!member) throw new Error('No perteneces a este equipo.')
    if (member.isLeader) throw new Error('El creador no puede abandonar el proyecto; debe transferirlo o cancelarlo')
    this.members[projectId] = this.members[projectId].filter((item) => item.userId !== member.userId)
  }

  async remove(projectId: string, userId: string, reason: string): Promise<void> {
    if (!reason.trim()) throw new Error('Indica el motivo de la remoción.')
    const member = this.members[projectId]?.find((item) => item.userId === userId)
    if (!member || member.isLeader) throw new Error('No se puede remover a este integrante.')
    this.members[projectId] = this.members[projectId].filter((item) => item.userId !== userId)
  }
}
