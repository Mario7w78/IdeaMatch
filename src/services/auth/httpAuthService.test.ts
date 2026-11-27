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
  const apiUser = { id: '7', firstName: 'Ana', lastName: 'Ruiz', email: 'ana@example.com', isAdmin: false, createdAt: '2026-11-27' }
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

  it('[HU02-FE] el registro queda pendiente y el código verifica el correo e inicia sesión', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ user: apiUser, verificationRequired: true, emailSent: true }, 201))
      .mockResolvedValueOnce(json({ token: 'jwt-verificado', user: apiUser }))
    vi.stubGlobal('fetch', fetchMock)

    const user = await httpAuthService.register({ firstName: 'Ana', lastName: 'Ruiz', email: 'ana@example.com', password: 'Secreta123' })
    expect(user.verified).toBe(false)
    expect(tokenStore.get()).toBeNull()

    const session = await httpAuthService.verifyEmailCode(' ana@example.com ', ' 482913 ')
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(url).toMatch(/\/api\/auth\/verify-email$/)
    expect(JSON.parse(init.body as string)).toEqual({ email: 'ana@example.com', code: '482913' })
    expect(session.user.verified).toBe(true)
    expect(tokenStore.get()).toBe('jwt-verificado')
  })

  it('[HU02-FE] un código incorrecto informa los intentos restantes y no abre sesión', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      json({ code: 'INVALID_CODE', message: 'El código no es válido o ya venció', details: { attemptsLeft: 3 } }, 400),
    ))
    await expect(httpAuthService.verifyEmailCode('ana@example.com', '000000')).rejects.toMatchObject({
      code: 'INVALID_CODE',
      attemptsLeft: 3,
    })
    expect(tokenStore.get()).toBeNull()
  })

  it('[HU02-FE] el login de una cuenta pendiente devuelve EMAIL_NOT_VERIFIED y se puede reenviar el código', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ code: 'EMAIL_NOT_VERIFIED', message: 'Pendiente' }, 403))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(httpAuthService.login('ana@example.com', 'Secreta123')).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED' })
    await httpAuthService.resendVerification('ana@example.com')
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(url).toMatch(/\/api\/auth\/resend-verification$/)
    expect(JSON.parse(init.body as string)).toEqual({ email: 'ana@example.com' })
  })
  it('[HU04-FE] pide el código y cambia la contraseña con /auth/reset-password', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    await httpAuthService.requestPasswordReset(' ana@example.com ')
    await httpAuthService.resetPasswordWithCode('ana@example.com', '482913', 'NuevaClave123')
    const [forgotUrl, forgotInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    const [resetUrl, resetInit] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(forgotUrl).toMatch(/\/api\/auth\/forgot-password$/)
    expect(JSON.parse(forgotInit.body as string)).toEqual({ email: 'ana@example.com' })
    expect(resetUrl).toMatch(/\/api\/auth\/reset-password$/)
    expect(JSON.parse(resetInit.body as string)).toEqual({ email: 'ana@example.com', code: '482913', newPassword: 'NuevaClave123' })
  })

  it('[HU04-FE] un código vencido o una contraseña débil devuelven errores de negocio', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(json({ code: 'INVALID_CODE', message: 'Venció' }, 400))
      .mockResolvedValueOnce(json({ code: 'WEAK_PASSWORD', message: 'Débil' }, 400)))
    await expect(httpAuthService.resetPasswordWithCode('ana@example.com', '000000', 'NuevaClave123')).rejects.toMatchObject({ code: 'INVALID_CODE' })
    await expect(httpAuthService.resetPasswordWithCode('ana@example.com', '482913', 'debil')).rejects.toMatchObject({ code: 'WEAK_PASSWORD' })
  })
})
