import { beforeEach, describe, expect, it } from 'vitest'
import { readMailbox } from '../mailbox'
import { createMockAuthService, RESET_TTL_MS, VERIFY_TTL_MS } from './mockAuthService'
import type { AuthService } from './types'

const ana = { firstName: 'Ana', lastName: 'Cárdenas', email: 'ana@correo.com', password: 'Ideas2026' }
const tokenFrom = (link: string) => link.split('/').pop()!

let clock = 0
let auth: AuthService

beforeEach(() => {
  clock = Date.parse('2026-11-16T10:00:00Z')
  auth = createMockAuthService({ delayMs: 0, now: () => clock, origin: 'http://localhost' })
})

async function registerAndVerify() {
  await auth.register(ana)
  await auth.verifyEmail(tokenFrom(readMailbox()[0].link))
}

describe('HU01 · Registro', () => {
  it('crea la cuenta sin verificar y envía el correo de activación', async () => {
    const user = await auth.register(ana)
    expect(user.verified).toBe(false)
    expect(user).not.toHaveProperty('passwordHash')
    const [mail] = readMailbox()
    expect(mail.to).toBe('ana@correo.com')
    expect(mail.link).toMatch(/\/verificar\//)
  })

  it('rechaza correos ya registrados o inválidos con el mismo mensaje', async () => {
    await auth.register(ana)
    await expect(auth.register({ ...ana, email: 'ANA@correo.com' })).rejects.toThrow(
      'El correo ingresado ya existe o no es válido',
    )
    await expect(auth.register({ ...ana, email: 'anacorreo.com' })).rejects.toThrow(
      'El correo ingresado ya existe o no es válido',
    )
  })

  it('no guarda la contraseña en texto plano', async () => {
    await auth.register(ana)
    expect(localStorage.getItem('im.users')).not.toContain(ana.password)
  })
})

describe('HU02 · Verificación de correo', () => {
  it('verifica la cuenta con un enlace vigente', async () => {
    await auth.register(ana)
    const user = await auth.verifyEmail(tokenFrom(readMailbox()[0].link))
    expect(user.verified).toBe(true)
  })

  it('rechaza enlaces expirados (> 24 h), alterados o ya usados', async () => {
    await auth.register(ana)
    const token = tokenFrom(readMailbox()[0].link)
    await expect(auth.verifyEmail(token + 'x')).rejects.toThrow('Enlace de activación inválido o expirado')
    clock += VERIFY_TTL_MS + 1
    await expect(auth.verifyEmail(token)).rejects.toThrow('Enlace de activación inválido o expirado')
  })

  it('permite reenviar el correo de activación', async () => {
    await auth.register(ana)
    await auth.resendVerification(ana.email)
    expect(readMailbox()).toHaveLength(2)
  })
})

describe('HU03 · Inicio de sesión', () => {
  it('inicia sesión con correo verificado y contraseña correcta', async () => {
    await registerAndVerify()
    const session = await auth.login(ana.email, ana.password)
    expect(session.user.email).toBe(ana.email)
    expect(await auth.getSession()).not.toBeNull()
  })

  it('usa un mensaje genérico para contraseña errónea o correo inexistente', async () => {
    await registerAndVerify()
    await expect(auth.login(ana.email, 'Otra1234')).rejects.toThrow('Credenciales inválidas')
    await expect(auth.login('nadie@correo.com', ana.password)).rejects.toThrow('Credenciales inválidas')
  })

  it('bloquea cuentas no verificadas', async () => {
    await auth.register(ana)
    await expect(auth.login(ana.email, ana.password)).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED' })
  })
})

describe('HU04 · Recuperación de contraseña', () => {
  it('envía un enlace válido por 1 hora y permite cambiar la contraseña', async () => {
    await registerAndVerify()
    await auth.requestPasswordReset(ana.email)
    const token = tokenFrom(readMailbox()[0].link)
    await auth.resetPassword(token, 'Nueva2026')
    await expect(auth.login(ana.email, ana.password)).rejects.toThrow('Credenciales inválidas')
    expect((await auth.login(ana.email, 'Nueva2026')).user.email).toBe(ana.email)
  })

  it('no revela si el correo existe', async () => {
    await expect(auth.requestPasswordReset('nadie@correo.com')).resolves.toBeUndefined()
    expect(readMailbox()).toHaveLength(0)
  })

  it('rechaza enlaces vencidos', async () => {
    await registerAndVerify()
    await auth.requestPasswordReset(ana.email)
    clock += RESET_TTL_MS + 1
    await expect(auth.resetPassword(tokenFrom(readMailbox()[0].link), 'Nueva2026')).rejects.toMatchObject({
      code: 'INVALID_TOKEN',
    })
  })
})

describe('HU05 · Cierre de sesión', () => {
  it('destruye la sesión', async () => {
    await registerAndVerify()
    const session = await auth.login(ana.email, ana.password)
    await auth.logout(session.token)
    expect(await auth.getSession()).toBeNull()
  })
})
