import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import type { AuthService } from '../services/auth'
import { readMailbox } from '../services/mailbox'
import { renderAt, testAuth } from './helpers'

const ana = { firstName: 'Ana', lastName: 'Cárdenas', email: 'ana@correo.com', password: 'Ideas2026' }
const lastCode = () => readMailbox()[0].code!

let auth: AuthService
beforeEach(async () => {
  auth = testAuth()
  await auth.register(ana)
  const session = await auth.verifyEmailCode(ana.email, lastCode())
  await auth.logout(session.token)
})

async function requestCode() {
  renderAt('/login', auth)
  const user = userEvent.setup()
  await user.click(await screen.findByRole('link', { name: '¿Olvidaste tu contraseña?' }))
  await user.type(await screen.findByLabelText('Correo electrónico'), ana.email)
  await user.click(screen.getByRole('button', { name: 'Enviar código' }))
  expect(await screen.findByRole('heading', { name: 'Crea una nueva contraseña' })).toBeInTheDocument()
  return user
}

describe('[HU04-FE] Recuperación de contraseña con código', () => {
  it('escenario feliz: con el código del correo crea una nueva contraseña y puede iniciar sesión', async () => {
    const user = await requestCode()
    expect(screen.getByText(ana.email)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reenviar código en \d+ s/i })).toBeDisabled()

    await user.type(screen.getByLabelText('Código de verificación'), lastCode())
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Nueva2026')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Nueva2026')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    expect(await screen.findByRole('heading', { name: 'Contraseña actualizada' })).toBeInTheDocument()
    await expect(auth.login(ana.email, 'Nueva2026')).resolves.toMatchObject({ user: { email: ana.email } })
  })

  it('escenario alterno: un código incorrecto muestra los intentos restantes y no cambia la contraseña', async () => {
    const user = await requestCode()
    await user.type(screen.getByLabelText('Código de verificación'), lastCode() === '000000' ? '111111' : '000000')
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Nueva2026')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Nueva2026')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    expect(await screen.findByText('El código no es válido o ya venció. Te quedan 4 intentos.')).toBeInTheDocument()
    await expect(auth.login(ana.email, ana.password)).resolves.toMatchObject({ user: { email: ana.email } })
  })

  it('no revela si el correo existe: un correo desconocido también pasa a la pantalla del código', async () => {
    renderAt('/recuperar', auth)
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Correo electrónico'), 'nadie@correo.com')
    await user.click(screen.getByRole('button', { name: 'Enviar código' }))
    expect(await screen.findByRole('heading', { name: 'Crea una nueva contraseña' })).toBeInTheDocument()
    expect(readMailbox().every((m) => m.to !== 'nadie@correo.com')).toBe(true)
  })
})
