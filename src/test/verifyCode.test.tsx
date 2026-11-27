import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { readMailbox } from '../services/mailbox'
import { renderAt, testAuth } from './helpers'

const ana = { firstName: 'Ana', lastName: 'Cárdenas', email: 'ana@correo.com', password: 'Ideas2026' }
const lastCode = () => readMailbox()[0].code!

async function fillRegister() {
  const user = userEvent.setup()
  await user.type(await screen.findByLabelText('Nombre'), ana.firstName)
  await user.type(screen.getByLabelText('Apellido'), ana.lastName)
  await user.type(screen.getByLabelText('Correo electrónico'), ana.email)
  await user.type(screen.getByLabelText('Contraseña'), ana.password)
  await user.type(screen.getByLabelText('Confirmar contraseña'), ana.password)
  await user.click(screen.getByRole('checkbox'))
  await user.click(screen.getByRole('button', { name: /crear mi cuenta/i }))
  return user
}

describe('[HU02-FE] Verificación del correo con código', () => {
  it('escenario feliz: tras registrarse ingresa el código y entra a la plataforma', async () => {
    renderAt('/registro', testAuth())
    const user = await fillRegister()

    expect(await screen.findByRole('heading', { name: '¡Tu cuenta fue creada!' })).toBeInTheDocument()
    expect(screen.getByText(ana.email)).toBeInTheDocument()
    // El código se acaba de enviar: el reenvío espera 60 s, como en el backend.
    expect(screen.getByRole('button', { name: /reenviar código en \d+ s/i })).toBeDisabled()

    // Pegar el código con espacios también funciona: solo se conservan los dígitos.
    const code = lastCode()
    await user.type(screen.getByLabelText('Código de verificación'), `${code.slice(0, 3)} ${code.slice(3)}`)
    expect(screen.getByLabelText('Código de verificación')).toHaveValue(code)
    await user.click(screen.getByRole('button', { name: /verificar y entrar/i }))

    expect(await screen.findByText(/merece/)).toBeInTheDocument()
  })

  it('escenario alterno: un código incorrecto muestra los intentos restantes y no inicia sesión', async () => {
    renderAt('/registro', testAuth())
    const user = await fillRegister()
    const field = await screen.findByLabelText('Código de verificación')

    await user.click(screen.getByRole('button', { name: /verificar y entrar/i }))
    expect(screen.getByText('Este campo es obligatorio.')).toBeInTheDocument()

    await user.type(field, '123')
    await user.click(screen.getByRole('button', { name: /verificar y entrar/i }))
    expect(screen.getByText('Ingresa los 6 dígitos del código.')).toBeInTheDocument()

    await user.clear(field)
    await user.type(field, lastCode() === '000000' ? '111111' : '000000')
    await user.click(screen.getByRole('button', { name: /verificar y entrar/i }))
    expect(await screen.findByText('El código no es válido o ya venció. Te quedan 4 intentos.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '¡Tu cuenta fue creada!' })).toBeInTheDocument()
  })

  it('escenario alterno: el login de una cuenta pendiente lleva a ingresar el código y permite reenviarlo', async () => {
    const auth = testAuth()
    await auth.register(ana)
    renderAt('/login', auth)
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Correo electrónico'), ana.email)
    await user.type(screen.getByLabelText('Contraseña'), ana.password)
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText(/aún no está verificada/)).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Ingresar código de verificación' }))

    expect(await screen.findByRole('heading', { name: 'Verifica tu correo' })).toBeInTheDocument()
    expect(screen.getByText(ana.email)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reenviar código' }))
    expect(await screen.findByText(/Te enviamos un código nuevo/)).toBeInTheDocument()
    expect(readMailbox()).toHaveLength(2)

    await user.type(screen.getByLabelText('Código de verificación'), lastCode())
    await user.click(screen.getByRole('button', { name: /verificar y entrar/i }))
    expect(await screen.findByText(/merece/)).toBeInTheDocument()
  })

  it('sin correo conocido (p. ej. al recargar) pide el correo junto con el código', async () => {
    const auth = testAuth()
    await auth.register(ana)
    renderAt('/verificar-correo', auth)
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Correo electrónico'), ana.email)
    await user.type(screen.getByLabelText('Código de verificación'), lastCode())
    await user.click(screen.getByRole('button', { name: /verificar y entrar/i }))
    expect(await screen.findByText(/merece/)).toBeInTheDocument()
  })
})
