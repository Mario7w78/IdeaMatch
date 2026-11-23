import { beforeEach, describe, expect, it } from 'vitest'
import { applicationService } from '../applications'
import { MockProjectsService } from './mockProjectsService'
import { ProjectsError, openVacancies, teamSize } from './types'

describe('MockProjectsService', () => {
  let service: MockProjectsService

  beforeEach(() => {
    localStorage.clear()
    service = new MockProjectsService()
  })

  describe('HU16 - Catálogo', () => {
    it('lista solo proyectos abiertos, 10 por página, del más reciente al más antiguo', async () => {
      const first = await service.listOpenProjects()
      expect(first.total).toBe(13)
      expect(first.items).toHaveLength(10)
      expect(first.totalPages).toBe(2)
      expect(first.items.every((p) => p.status === 'OPEN')).toBe(true)
      const dates = first.items.map((p) => p.createdAt)
      expect([...dates].sort().reverse()).toEqual(dates)

      const second = await service.listOpenProjects({ page: 2 })
      expect(second.items).toHaveLength(3)
      expect(second.page).toBe(2)
    })

    it('un proyecto cerrado no aparece en el catálogo', async () => {
      const all = await service.listOpenProjects({ pageSize: 50 })
      expect(all.items.some((p) => p.id === 'proj-aurora-closed')).toBe(false)
    })

    it('una página fuera de rango devuelve la última', async () => {
      const page = await service.listOpenProjects({ page: 99 })
      expect(page.page).toBe(2)
    })

    it('sin proyectos devuelve una lista vacía', async () => {
      service.replaceAll([])
      const page = await service.listOpenProjects()
      expect(page).toMatchObject({ total: 0, items: [], totalPages: 1 })
    })
  })

  describe('HU17 - Detalle', () => {
    it('devuelve el proyecto con creador, equipo y roles', async () => {
      const p = await service.getProject('proj-neurobloom')
      expect(p?.title).toBe('NeuroBloom')
      expect(p?.creatorName).toBe('Laura Ríos')
      expect(p?.goals).toHaveLength(3)
      expect(teamSize(p!)).toBe(4)
      expect(openVacancies(p!)).toBe(6)
    })

    it('un proyecto que no existe devuelve null', async () => {
      expect(await service.getProject('9999')).toBeNull()
    })
  })

  describe('HU14 - Cambio de estado', () => {
    it('el creador pausa su proyecto y se bloquean las nuevas postulaciones', async () => {
      const updated = await service.changeStatus('proj-verdecerca', 'user1', 'PAUSED')
      expect(updated.status).toBe('PAUSED')
      expect((await service.listOpenProjects({ pageSize: 50 })).items.some((p) => p.id === 'proj-verdecerca')).toBe(false)
      await expect(
        applicationService.applyToRole('user2', {
          projectId: 'proj-verdecerca',
          roleId: 'role-vc-researcher',
          note: 'Me gustaría sumarme',
        }),
      ).rejects.toMatchObject({ code: 'PROJECT_NOT_OPEN' })
    })

    it('un proyecto pausado se puede reanudar', async () => {
      await service.changeStatus('proj-verdecerca', 'user1', 'PAUSED')
      const resumed = await service.changeStatus('proj-verdecerca', 'user1', 'OPEN')
      expect(resumed.status).toBe('OPEN')
    })

    it('de Cerrado a «En curso» es una transición no válida', async () => {
      await service.changeStatus('proj-verdecerca', 'user1', 'CLOSED')
      const error = await service.changeStatus('proj-verdecerca', 'user1', 'IN_PROGRESS').catch((e: unknown) => e)
      expect(error).toBeInstanceOf(ProjectsError)
      expect((error as ProjectsError).code).toBe('INVALID_TRANSITION')
      expect((error as ProjectsError).message).toBe('Transición de estado no válida')
      // Reabrirlo formalmente sí está permitido.
      expect((await service.changeStatus('proj-verdecerca', 'user1', 'OPEN')).status).toBe('OPEN')
    })

    it('quien no es el creador recibe un error de permisos', async () => {
      await expect(service.changeStatus('proj-verdecerca', 'user2', 'PAUSED')).rejects.toMatchObject({
        code: 'FORBIDDEN',
      })
    })

    it('un proyecto inexistente falla con PROJECT_NOT_FOUND', async () => {
      await expect(service.changeStatus('9999', 'user1', 'PAUSED')).rejects.toMatchObject({
        code: 'PROJECT_NOT_FOUND',
      })
    })
  })
})
