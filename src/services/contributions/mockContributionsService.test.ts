import { beforeEach, describe, expect, it } from 'vitest'
import { MockContributionsService } from './mockContributionsService'

const withAccounts = () =>
  localStorage.setItem(
    'im.users',
    JSON.stringify([
      { id: 'user1', firstName: 'User', lastName: '1', email: 'user1@ideamatch.com' },
      { id: 'user2', firstName: 'User', lastName: '2', email: 'user2@ideamatch.com' },
    ]),
  )

describe('MockContributionsService (HU43)', () => {
  let service: MockContributionsService

  beforeEach(() => {
    localStorage.clear()
    withAccounts()
    service = new MockContributionsService()
  })

  it('asocia el evento externo a la cuenta con el mismo correo y queda pendiente de validación', async () => {
    const c = await service.receiveExternalEvent({
      projectId: 'proj-ecoruta',
      tool: 'github',
      actorEmail: 'User2@IdeaMatch.com',
      summary: 'Commit 4f2a: corrige el mapa',
    })
    expect(c.status).toBe('pending')
    expect(c.collaboratorId).toBe('user2')
    expect(c.collaboratorName).toBe('User 2')
  })

  it('si el correo no coincide con ninguna cuenta se registra como no asociada', async () => {
    const before = await service.listForCreator('user1', 'pending')
    const c = await service.receiveExternalEvent({
      projectId: 'proj-ecoruta',
      tool: 'trello',
      actorEmail: 'desconocido@correo.com',
      summary: 'Tarjeta movida a «Hecho»',
    })
    expect(c.status).toBe('unassociated')
    expect(c.collaboratorId).toBeUndefined()
    // No afecta a las pendientes ni a las validadas de nadie.
    expect(await service.listForCreator('user1', 'pending')).toHaveLength(before.length)
    expect(await service.listValidatedForUser('user2')).toHaveLength(1)
  })

  it('rechaza eventos de un proyecto que no existe', async () => {
    await expect(
      service.receiveExternalEvent({
        projectId: 'otro',
        tool: 'figma',
        actorEmail: 'user2@ideamatch.com',
        summary: 'Cambio',
      }),
    ).rejects.toMatchObject({ code: 'UNKNOWN_PROJECT' })
  })

  it('el creador valida y la contribución aparece entre las validadas del colaborador', async () => {
    await service.validate('con-1', 'user1')
    const validated = await service.listValidatedForUser('user2')
    expect(validated.map((c) => c.id)).toContain('con-1')
  })

  it('una contribución rechazada no aparece en el perfil del colaborador', async () => {
    await service.reject('con-2', 'user1')
    const validated = await service.listValidatedForUser('user2')
    expect(validated.map((c) => c.id)).not.toContain('con-2')
  })

  it('solo el creador del proyecto puede revisar', async () => {
    await expect(service.validate('con-1', 'user2')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('no se puede validar una contribución no asociada ni una ya procesada', async () => {
    await expect(service.validate('con-3', 'user1')).rejects.toMatchObject({ code: 'NOT_ASSOCIATED' })
    await expect(service.validate('con-4', 'user1')).rejects.toMatchObject({ code: 'NOT_PENDING' })
  })
})
