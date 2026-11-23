import { sendMail } from '../mailbox'

export interface ProjectRole {
  id: string
  title: string
  vacancies: number
  filledVacancies: number
  skills: string[]
  description?: string
}

export interface Project {
  id: string
  title: string
  summary: string
  description: string
  categoryId: string
  categoryName: string
  creatorId: string
  creatorName: string
  status: 'Abierto' | 'En curso' | 'Cerrado' | 'Cancelado'
  roles: ProjectRole[]
  githubUrl?: string
  figmaUrl?: string
  trelloUrl?: string
  createdAt: string
  updatedAt: string
}

export type ApplicationStatus = 'Pendiente' | 'Aceptada' | 'Rechazada'

export interface Application {
  id: string
  projectId: string
  projectTitle: string
  roleId: string
  roleTitle: string
  applicantId: string
  applicantName: string
  applicantEmail: string
  coverNote: string
  status: ApplicationStatus
  appliedAt: string
  resolvedAt?: string
}

export interface TeamMember {
  id: string
  projectId: string
  userId: string
  userName: string
  userEmail: string
  roleId: string
  roleTitle: string
  isLeader: boolean
  joinedAt: string
  status: 'Activo' | 'Retirado' | 'Removido'
}

export interface ChatMessage {
  id: string
  projectId: string
  senderId: string
  senderName: string
  content: string
  attachmentUrl?: string
  attachmentType?: 'image' | 'document' | 'link'
  sentAt: string
}

export interface InAppNotification {
  id: string
  userId: string
  title: string
  message: string
  type: 'application_submitted' | 'application_accepted' | 'application_rejected' | 'chat_message' | 'system'
  read: boolean
  createdAt: string
  link?: string
}

export interface PlatformMetrics {
  totalUsers: number
  activeProjects: number
  totalApplications: number
  acceptedApplications: number
  acceptanceRatePercentage: number
  cachedAt: string
}

export class PlatformError extends Error {
  readonly code:
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'NO_VACANCIES'
    | 'DUPLICATE_APPLICATION'
    | 'INVALID_STATUS_TRANSITION'
    | 'CANNOT_LEAVE_AS_LEADER'
    | 'CHAT_ACCESS_DENIED'
    | 'ATTACHMENT_TOO_LARGE'

  constructor(
    code:
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'NO_VACANCIES'
      | 'DUPLICATE_APPLICATION'
      | 'INVALID_STATUS_TRANSITION'
      | 'CANNOT_LEAVE_AS_LEADER'
      | 'CHAT_ACCESS_DENIED'
      | 'ATTACHMENT_TOO_LARGE',
    message: string,
  ) {
    super(message)
    this.name = 'PlatformError'
    this.code = code
  }
}

export class MockPlatformService {
  public projects: Project[] = []
  public applications: Application[] = []
  public teamMembers: TeamMember[] = []
  public messages: ChatMessage[] = []
  public notifications: InAppNotification[] = []
  public externalWebhooks: Array<{ id: string; provider: string; payload: unknown; receivedAt: string }> = []

  constructor() {
    this.seed()
  }

  seed() {
    this.projects = [
      {
        id: 'proj-1',
        title: 'EcoTrack - Monitoreo de Huella de Carbono',
        summary: 'App colaborativa para medir y compensar emisiones de CO2.',
        description: 'Plataforma para calcular huella ambiental personal y de equipos.',
        categoryId: 'cat-5',
        categoryName: 'Sostenibilidad & Clima',
        creatorId: 'user-creator-1',
        creatorName: 'Carlos Mendonza',
        status: 'Abierto',
        roles: [
          {
            id: 'role-dev',
            title: 'Frontend React Developer',
            vacancies: 2,
            filledVacancies: 1,
            skills: ['React', 'TypeScript', 'Tailwind'],
          },
          {
            id: 'role-ui',
            title: 'Diseñador UI/UX',
            vacancies: 1,
            filledVacancies: 0,
            skills: ['Figma', 'Design Systems'],
          },
        ],
        createdAt: '2026-11-10T10:00:00Z',
        updatedAt: '2026-11-10T10:00:00Z',
      },
    ]

    this.teamMembers = [
      {
        id: 'tm-1',
        projectId: 'proj-1',
        userId: 'user-creator-1',
        userName: 'Carlos Mendonza',
        userEmail: 'carlos@correo.com',
        roleId: 'leader',
        roleTitle: 'Líder del proyecto',
        isLeader: true,
        joinedAt: '2026-11-10T10:00:00Z',
        status: 'Activo',
      },
      {
        id: 'tm-2',
        projectId: 'proj-1',
        userId: 'user-colab-1',
        userName: 'Sofía Martínez',
        userEmail: 'sofia@correo.com',
        roleId: 'role-dev',
        roleTitle: 'Frontend React Developer',
        isLeader: false,
        joinedAt: '2026-11-12T15:00:00Z',
        status: 'Activo',
      },
    ]

    this.applications = [
      {
        id: 'app-1',
        projectId: 'proj-1',
        projectTitle: 'EcoTrack - Monitoreo de Huella de Carbono',
        roleId: 'role-ui',
        roleTitle: 'Diseñador UI/UX',
        applicantId: 'user-colab-2',
        applicantName: 'Lucía Vega',
        applicantEmail: 'lucia@correo.com',
        coverNote: 'Tengo 3 años diseñando productos digitales sostenibles en Figma.',
        status: 'Pendiente',
        appliedAt: '2026-11-14T11:00:00Z',
      },
    ]

    this.messages = [
      {
        id: 'msg-1',
        projectId: 'proj-1',
        senderId: 'user-creator-1',
        senderName: 'Carlos Mendonza',
        content: '¡Bienvenidos al equipo de EcoTrack! Empezaremos el sprint el lunes.',
        sentAt: '2026-11-12T16:00:00Z',
      },
    ]

    this.notifications = []
    this.externalWebhooks = []
  }

  createProject(creatorId: string, creatorName: string, data: Omit<Project, 'id' | 'creatorId' | 'creatorName' | 'createdAt' | 'updatedAt'>): Project {
    const project: Project = {
      ...data,
      id: `proj-${crypto.randomUUID()}`,
      creatorId,
      creatorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.projects.push(project)

    this.teamMembers.push({
      id: `tm-${crypto.randomUUID()}`,
      projectId: project.id,
      userId: creatorId,
      userName: creatorName,
      userEmail: `${creatorId}@correo.com`,
      roleId: 'leader',
      roleTitle: 'Líder del proyecto',
      isLeader: true,
      joinedAt: project.createdAt,
      status: 'Activo',
    })

    return project
  }

  getProject(id: string): Project | null {
    return this.projects.find((p) => p.id === id) ?? null
  }

  getProjects(): Project[] {
    return [...this.projects]
  }

  updateProject(projectId: string, userId: string, patch: Partial<Project>): Project {
    const p = this.getProject(projectId)
    if (!p) throw new PlatformError('NOT_FOUND', 'Proyecto no encontrado.')
    if (p.creatorId !== userId) {
      throw new PlatformError('FORBIDDEN', 'No tienes permisos para editar este proyecto.')
    }
    Object.assign(p, patch, { updatedAt: new Date().toISOString() })
    return p
  }

  applyToRole(input: {
    projectId: string
    roleId: string
    applicantId: string
    applicantName: string
    applicantEmail: string
    coverNote: string
  }): Application {
    const project = this.getProject(input.projectId)
    if (!project) throw new PlatformError('NOT_FOUND', 'Proyecto no encontrado.')
    if (project.status !== 'Abierto') {
      throw new PlatformError('INVALID_STATUS_TRANSITION', 'El proyecto no acepta nuevas postulaciones.')
    }

    const role = project.roles.find((r) => r.id === input.roleId)
    if (!role) throw new PlatformError('NOT_FOUND', 'Rol no encontrado.')
    if (role.vacancies - role.filledVacancies <= 0) {
      throw new PlatformError('NO_VACANCIES', 'No quedan vacantes disponibles para este rol.')
    }

    const duplicate = this.applications.find(
      (a) => a.projectId === input.projectId && a.applicantId === input.applicantId,
    )
    if (duplicate) {
      throw new PlatformError('DUPLICATE_APPLICATION', 'Ya enviaste una postulación para este proyecto.')
    }

    const app: Application = {
      id: `app-${crypto.randomUUID()}`,
      projectId: input.projectId,
      projectTitle: project.title,
      roleId: input.roleId,
      roleTitle: role.title,
      applicantId: input.applicantId,
      applicantName: input.applicantName,
      applicantEmail: input.applicantEmail,
      coverNote: input.coverNote,
      status: 'Pendiente',
      appliedAt: new Date().toISOString(),
    }
    this.applications.push(app)

    this.notifications.push({
      id: `notif-${crypto.randomUUID()}`,
      userId: project.creatorId,
      title: 'Nueva postulación recibida',
      message: `${input.applicantName} se ha postulado para el rol de ${role.title} en «${project.title}».`,
      type: 'application_submitted',
      read: false,
      createdAt: app.appliedAt,
      link: `/app/postulaciones?proyecto=${project.id}`,
    })

    return app
  }

  acceptApplication(applicationId: string, currentUserId: string): { application: Application; teamMember: TeamMember } {
    const app = this.applications.find((a) => a.id === applicationId)
    if (!app) throw new PlatformError('NOT_FOUND', 'Postulación no encontrada.')
    if (app.status !== 'Pendiente') {
      throw new PlatformError('INVALID_STATUS_TRANSITION', 'La postulación ya no está pendiente.')
    }

    const project = this.getProject(app.projectId)
    if (!project) throw new PlatformError('NOT_FOUND', 'Proyecto no encontrado.')
    if (project.creatorId !== currentUserId) {
      throw new PlatformError('FORBIDDEN', 'Solo el creador del proyecto puede aceptar candidatos.')
    }

    const role = project.roles.find((r) => r.id === app.roleId)
    if (!role) throw new PlatformError('NOT_FOUND', 'Rol no encontrado en el proyecto.')

    if (role.vacancies - role.filledVacancies <= 0) {
      throw new PlatformError('NO_VACANCIES', 'No quedan vacantes disponibles.')
    }

    role.filledVacancies += 1
    app.status = 'Aceptada'
    app.resolvedAt = new Date().toISOString()

    const newMember: TeamMember = {
      id: `tm-${crypto.randomUUID()}`,
      projectId: project.id,
      userId: app.applicantId,
      userName: app.applicantName,
      userEmail: app.applicantEmail,
      roleId: role.id,
      roleTitle: role.title,
      isLeader: false,
      joinedAt: app.resolvedAt,
      status: 'Activo',
    }
    this.teamMembers.push(newMember)

    this.notifications.push({
      id: `notif-${crypto.randomUUID()}`,
      userId: app.applicantId,
      title: '¡Postulación Aceptada!',
      message: `Has sido incorporado al equipo de «${project.title}» en el rol de ${role.title}.`,
      type: 'application_accepted',
      read: false,
      createdAt: app.resolvedAt,
      link: `/app/mensajes?proyecto=${project.id}`,
    })

    sendMail({
      to: app.applicantEmail,
      subject: `¡Fuiste aceptado en ${project.title}!`,
      body: `Felicidades ${app.applicantName}, el creador aceptó tu postulación para el rol de ${role.title}.`,
      link: `http://localhost/app/mensajes?proyecto=${project.id}`,
    })

    return { application: app, teamMember: newMember }
  }

  rejectApplication(applicationId: string, currentUserId: string): Application {
    const app = this.applications.find((a) => a.id === applicationId)
    if (!app) throw new PlatformError('NOT_FOUND', 'Postulación no encontrada.')
    if (app.status !== 'Pendiente') {
      throw new PlatformError('INVALID_STATUS_TRANSITION', 'Solo se pueden rechazar postulaciones pendientes.')
    }

    const project = this.getProject(app.projectId)
    if (!project || project.creatorId !== currentUserId) {
      throw new PlatformError('FORBIDDEN', 'Solo el creador del proyecto puede rechazar candidatos.')
    }

    app.status = 'Rechazada'
    app.resolvedAt = new Date().toISOString()

    this.notifications.push({
      id: `notif-${crypto.randomUUID()}`,
      userId: app.applicantId,
      title: 'Actualización sobre tu postulación',
      message: `El creador del proyecto «${project.title}» ha decidido avanzar con otro perfil para este rol.`,
      type: 'application_rejected',
      read: false,
      createdAt: app.resolvedAt,
    })

    return app
  }

  getMyApplications(userId: string): Application[] {
    return this.applications.filter((a) => a.applicantId === userId)
  }

  getTeamMembers(projectId: string): TeamMember[] {
    return this.teamMembers.filter((tm) => tm.projectId === projectId && tm.status === 'Activo')
  }

  leaveTeam(projectId: string, userId: string): TeamMember {
    const member = this.teamMembers.find(
      (tm) => tm.projectId === projectId && tm.userId === userId && tm.status === 'Activo',
    )
    if (!member) throw new PlatformError('NOT_FOUND', 'No perteneces activamente a este equipo.')
    if (member.isLeader) {
      throw new PlatformError('CANNOT_LEAVE_AS_LEADER', 'El líder del proyecto no puede abandonar el equipo sin transferir la propiedad.')
    }

    member.status = 'Retirado'

    const project = this.getProject(projectId)
    if (project) {
      const role = project.roles.find((r) => r.id === member.roleId)
      if (role && role.filledVacancies > 0) {
        role.filledVacancies -= 1
      }
    }

    return member
  }

  removeTeamMember(projectId: string, memberUserId: string, currentUserId: string): TeamMember {
    const project = this.getProject(projectId)
    if (!project || project.creatorId !== currentUserId) {
      throw new PlatformError('FORBIDDEN', 'Solo el creador del proyecto puede remover integrantes.')
    }

    const member = this.teamMembers.find(
      (tm) => tm.projectId === projectId && tm.userId === memberUserId && tm.status === 'Activo',
    )
    if (!member) throw new PlatformError('NOT_FOUND', 'Integrante no encontrado.')
    if (member.isLeader) {
      throw new PlatformError('FORBIDDEN', 'No puedes remover al líder del proyecto.')
    }

    member.status = 'Removido'

    const role = project.roles.find((r) => r.id === member.roleId)
    if (role && role.filledVacancies > 0) {
      role.filledVacancies -= 1
    }

    return member
  }

  isUserInProjectTeam(projectId: string, userId: string): boolean {
    return this.teamMembers.some(
      (tm) => tm.projectId === projectId && tm.userId === userId && tm.status === 'Activo',
    )
  }

  getChatMessages(projectId: string, currentUserId: string): ChatMessage[] {
    if (!this.isUserInProjectTeam(projectId, currentUserId)) {
      throw new PlatformError('CHAT_ACCESS_DENIED', '403: No formas parte de este equipo para acceder a la conversación.')
    }
    return this.messages.filter((m) => m.projectId === projectId)
  }

  sendChatMessage(input: {
    projectId: string
    senderId: string
    senderName: string
    content: string
    attachmentUrl?: string
    attachmentType?: 'image' | 'document' | 'link'
    attachmentSizeBytes?: number
  }): ChatMessage {
    if (!this.isUserInProjectTeam(input.projectId, input.senderId)) {
      throw new PlatformError('CHAT_ACCESS_DENIED', '403: Ya no formas parte de este equipo.')
    }

    if (input.attachmentSizeBytes && input.attachmentSizeBytes > 5 * 1024 * 1024) {
      throw new PlatformError('ATTACHMENT_TOO_LARGE', 'El archivo adjunto supera el límite de 5 MB.')
    }

    const msg: ChatMessage = {
      id: `msg-${crypto.randomUUID()}`,
      projectId: input.projectId,
      senderId: input.senderId,
      senderName: input.senderName,
      content: input.content,
      attachmentUrl: input.attachmentUrl,
      attachmentType: input.attachmentType,
      sentAt: new Date().toISOString(),
    }
    this.messages.push(msg)
    return msg
  }

  getNotifications(userId: string): InAppNotification[] {
    return this.notifications.filter((n) => n.userId === userId)
  }

  markNotificationAsRead(notificationId: string): void {
    const n = this.notifications.find((notif) => notif.id === notificationId)
    if (n) n.read = true
  }

  markAllNotificationsAsRead(userId: string): void {
    this.notifications.filter((n) => n.userId === userId).forEach((n) => (n.read = true))
  }

  getMetrics(): PlatformMetrics {
    const activeProjects = this.projects.filter((p) => p.status === 'Abierto' || p.status === 'En curso').length
    const totalApplications = this.applications.length
    const acceptedApplications = this.applications.filter((a) => a.status === 'Aceptada').length
    const acceptanceRate = totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0

    return {
      totalUsers: 48,
      activeProjects,
      totalApplications,
      acceptedApplications,
      acceptanceRatePercentage: acceptanceRate,
      cachedAt: new Date().toISOString(),
    }
  }

  receiveWebhook(provider: string, payload: unknown, secretHeader: string): { success: boolean; eventId: string } {
    if (secretHeader !== 'valid-webhook-secret') {
      throw new PlatformError('FORBIDDEN', 'Firma o secreto de webhook inválido.')
    }
    const eventId = `evt-${crypto.randomUUID()}`
    this.externalWebhooks.push({
      id: eventId,
      provider,
      payload,
      receivedAt: new Date().toISOString(),
    })
    return { success: true, eventId }
  }

  getReceivedWebhooks() {
    return [...this.externalWebhooks]
  }
}

export const platformService = new MockPlatformService()
