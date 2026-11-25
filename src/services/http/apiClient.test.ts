import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, ApiError, tokenStore } from './apiClient'

describe('cliente HTTP transversal', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllGlobals())

  it('envía JWT Bearer y JSON al backend', async () => {
    tokenStore.set('jwt-prueba')
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    expect(await apiRequest<{ ok: boolean }>('/projects/1/applications', { method: 'POST', body: {} })).toEqual({ ok: true })
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/projects\/1\/applications$/)
    expect(new Headers(request.headers).get('Authorization')).toBe('Bearer jwt-prueba')
    expect(new Headers(request.headers).get('Content-Type')).toBe('application/json')
  })

  it('conserva código, estado y mensaje de un error de negocio', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'NOT_OWNER', message: 'Sin permiso' }), { status: 403 })))
    await expect(apiRequest('/projects/2/applications')).rejects.toMatchObject({
      status: 403, code: 'NOT_OWNER', message: 'Sin permiso',
    } satisfies Partial<ApiError>)
  })
})
