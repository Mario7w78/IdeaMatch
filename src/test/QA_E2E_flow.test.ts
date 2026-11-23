import { beforeEach, describe, expect, it } from 'vitest'
import { createMockAuthService } from '../services/auth/mockAuthService'
import { MockPlatformService } from '../services/platform'
import { readMailbox } from '../services/mailbox'

describe('QA-E2E · Prueba de punta a punta: Registro → Publicar → Postular → Aceptar → Chat', () => {
  let auth: ReturnType<typeof createMockAuthService>
  let platform: MockPlatformService

  beforeEach(() => {
    localStorage.clear()
    auth = createMockAuthService({ delayMs: 0, origin: 'http://localhost' })
    platform = new MockPlatformService()
  })

  it('ejecuta con éxito el flujo integral de vida del proyecto', async () => {
    // -------------------------------------------------------------------------
    // PASO 1: Registro e Inicio de sesión del Creador (Ana)
    // -------------------------------------------------------------------------
    const anaUser = await auth.register({
      firstName: 'Ana',
      lastName: 'Cárdenas',
      email: 'ana.creadora@correo.com',
      password: 'Password2026',
    })
    expect(anaUser.email).toBe('ana.creadora@correo.com')

    const anaMail = readMailbox().find((m) => m.to === 'ana.creadora@correo.com')!
    const tokenAna = anaMail.link.split('/').pop()!
    await auth.verifyEmail(tokenAna)

    const anaSession = await auth.login('ana.creadora@correo.com', 'Password2026')
    expect(anaSession.token).toBeDefined()

    // -------------------------------------------------------------------------
    // PASO 2: Publicar una nueva idea con roles y vacantes
    // -------------------------------------------------------------------------
    const nuevoProyecto = platform.createProject(anaSession.user.id, 'Ana Cárdenas', {
      title: 'Plataforma EduMatch',
      summary: 'Conectando mentores y estudiantes mediante algoritmos de afinidad.',
      description: 'Una solución de mentoría entre pares para escuelas públicas.',
      categoryId: 'cat-4',
      categoryName: 'Educación Tech',
      status: 'Abierto',
      roles: [
        {
          id: 'role-front',
          title: 'Desarrollador Frontend',
          vacancies: 1,
          filledVacancies: 0,
          skills: ['React', 'TypeScript'],
          description: 'Construcción de interfaces y componentes accesibles.',
        },
      ],
    })

    expect(nuevoProyecto.id).toBeDefined()
    expect(nuevoProyecto.creatorId).toBe(anaSession.user.id)
    expect(platform.getProject(nuevoProyecto.id)).not.toBeNull()

    // -------------------------------------------------------------------------
    // PASO 3: Registro y postulación de un Colaborador (Mateo)
    // -------------------------------------------------------------------------
    const mateoUser = await auth.register({
      firstName: 'Mateo',
      lastName: 'Silva',
      email: 'mateo.dev@correo.com',
      password: 'Password2026',
    })
    expect(mateoUser.email).toBe('mateo.dev@correo.com')

    const mateoMail = readMailbox().find((m) => m.to === 'mateo.dev@correo.com')!
    const tokenMateo = mateoMail.link.split('/').pop()!
    await auth.verifyEmail(tokenMateo)

    const mateoSession = await auth.login('mateo.dev@correo.com', 'Password2026')
    expect(mateoSession.token).toBeDefined()

    const postulacion = platform.applyToRole({
      projectId: nuevoProyecto.id,
      roleId: 'role-front',
      applicantId: mateoSession.user.id,
      applicantName: `${mateoSession.user.firstName} ${mateoSession.user.lastName}`,
      applicantEmail: mateoSession.user.email,
      coverNote: 'Hola Ana, cuento con 2 años desarrollando apps en React y me apasiona la educación.',
    })

    expect(postulacion.status).toBe('Pendiente')
    expect(postulacion.roleTitle).toBe('Desarrollador Frontend')

    const notifsAna = platform.getNotifications(anaSession.user.id)
    expect(notifsAna.some((n) => n.message.includes('Mateo Silva'))).toBe(true)

    // -------------------------------------------------------------------------
    // PASO 4: La creadora revisa y Acepta la postulación de Mateo
    // -------------------------------------------------------------------------
    const aceptacion = platform.acceptApplication(postulacion.id, anaSession.user.id)
    expect(aceptacion.application.status).toBe('Aceptada')

    const proyectoActualizado = platform.getProject(nuevoProyecto.id)!
    const rolActualizado = proyectoActualizado.roles.find((r) => r.id === 'role-front')!
    expect(rolActualizado.filledVacancies).toBe(1)
    expect(rolActualizado.vacancies - rolActualizado.filledVacancies).toBe(0)

    const equipo = platform.getTeamMembers(nuevoProyecto.id)
    expect(equipo.some((m) => m.userId === mateoSession.user.id)).toBe(true)

    const notifsMateo = platform.getNotifications(mateoSession.user.id)
    expect(notifsMateo.some((n) => n.type === 'application_accepted')).toBe(true)

    // -------------------------------------------------------------------------
    // PASO 5: Coordinación en el Chat Grupal del Proyecto
    // -------------------------------------------------------------------------
    const mensaje1 = platform.sendChatMessage({
      projectId: nuevoProyecto.id,
      senderId: anaSession.user.id,
      senderName: 'Ana Cárdenas',
      content: '¡Hola Mateo! Qué gusto tenerte en el equipo de EduMatch.',
    })
    expect(mensaje1.content).toContain('Qué gusto tenerte')

    const mensaje2 = platform.sendChatMessage({
      projectId: nuevoProyecto.id,
      senderId: mateoSession.user.id,
      senderName: 'Mateo Silva',
      content: '¡Gracias Ana! Ya revisé el alcance y estoy listo para iniciar.',
    })
    expect(mensaje2.content).toContain('estoy listo para iniciar')

    const mensajesSala = platform.getChatMessages(nuevoProyecto.id, mateoSession.user.id)
    expect(mensajesSala).toHaveLength(2)
    expect(mensajesSala[0].senderName).toBe('Ana Cárdenas')
    expect(mensajesSala[1].senderName).toBe('Mateo Silva')

    expect(() => platform.getChatMessages(nuevoProyecto.id, 'usuario-externo-espia')).toThrow(
      '403: No formas parte de este equipo para acceder a la conversación.',
    )
  })
})
