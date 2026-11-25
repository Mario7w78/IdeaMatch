import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHttpAuthService } from './httpAuthService'
import { tokenStore } from '../http/apiClient'

const httpAuthService = createHttpAuthService()

describe('autenticación HTTP', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllGlobals())

  it('guarda el JWT real y adapta el rol de administrador', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      token: 'jwt-real', user: { id: '1', firstName: 'Ana', lastName: 'Ruiz', email: 'ana@example.com', isAdmin: true, createdAt: '2026-11-24' },
    }), { status: 200 })))
    const session = await httpAuthService.login('ana@example.com', 'Password123')
    expect(session.user.role).toBe('admin')
    expect(tokenStore.get()).toBe('jwt-real')
  })

  it('borra la sesión cuando /auth/me responde 401', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'jwt-real', user: { id: '1', firstName: 'Ana', lastName: 'Ruiz', email: 'ana@example.com', isAdmin: false, createdAt: '2026-11-24' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'UNAUTHORIZED', message: 'Expiró' }), { status: 401 })))
    await httpAuthService.login('ana@example.com', 'Password123')
    expect(await httpAuthService.getSession()).toBeNull()
    expect(tokenStore.get()).toBeNull()
  })
})
