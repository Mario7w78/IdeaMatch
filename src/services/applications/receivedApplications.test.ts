import { afterEach, describe, expect, it, vi } from 'vitest'
import { receivedApplicationsService } from './receivedApplications'

afterEach(() => vi.unstubAllGlobals())

describe('HU25–HU27: postulaciones recibidas', () => {
  it('HU25 lista candidatos pendientes de un proyecto real', async () => {
    const payload = { roleCounts: [], total: 1, vacancies: 1, page: 1, limit: 50, items: [{ id: '5' }] }
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }))
    vi.stubGlobal('fetch', request)
    expect((await receivedApplicationsService.list('42')).items).toHaveLength(1)
    expect(request.mock.calls[0][0]).toMatch(/\/api\/projects\/42\/applications\?status=pendiente/)
  })

  it('HU25 conserva el 403 para un usuario que no es creador', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'NOT_OWNER', message: 'Sin permiso' }), { status: 403 })))
    await expect(receivedApplicationsService.list('42')).rejects.toMatchObject({ status: 403, code: 'NOT_OWNER' })
  })

  it('HU26 acepta mediante POST y expone el conflicto de vacantes', async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'NO_VACANCIES', message: 'Sin vacantes' }), { status: 409 }))
    vi.stubGlobal('fetch', request)
    await expect(receivedApplicationsService.accept('5')).rejects.toMatchObject({ status: 409, code: 'NO_VACANCIES' })
    expect(request.mock.calls[0][0]).toMatch(/\/api\/applications\/5\/accept$/)
    expect(request.mock.calls[0][1].method).toBe('POST')
  })

  it('HU27 rechaza mediante POST y expone el conflicto de estado', async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'NOT_PENDING', message: 'Procesada' }), { status: 409 }))
    vi.stubGlobal('fetch', request)
    await expect(receivedApplicationsService.reject('5')).rejects.toMatchObject({ status: 409, code: 'NOT_PENDING' })
    expect(request.mock.calls[0][0]).toMatch(/\/api\/applications\/5\/reject$/)
  })
})
