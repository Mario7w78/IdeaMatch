import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from '../App'
import { AuthProvider } from '../context/AuthContext'
import { readMailbox } from '../services/mailbox'
import { createMockAuthService } from '../services/auth/mockAuthService'
import type { AuthService } from '../services/auth'

function renderAt(path: string, service: AuthService) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider service={service}>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
}

const newService = () => createMockAuthService({ delayMs: 0, origin: 'http://localhost' })

async function fillRegister(email: string) {
  const user = userEvent.setup()
  await user.type(await screen.findByLabelText('Nombre'), 'Ana')
  await user.type(screen.getByLabelText('Apellido'), 'Cárdenas')
  await user.type(screen.getByLabelText('Correo electrónico'), email)
  await user.type(screen.getByLabelText('Contraseña'), 'Ideas2026')
  await user.type(screen.getByLabelText('Confirmar contraseña'), 'Ideas2026')
  await user.click(screen.getByRole('checkbox'))
  await user.click(screen.getByRole('button', { name: /crear mi cuenta/i }))
  return user
}

describe('flujos de acceso', () => {
  it('registro exitoso muestra la confirmación y envía el correo', async () => {
    renderAt('/registro', newService())
    await fillRegister('ana@correo.com')
    expect(await screen.findByRole('heading', { name: '¡Tu cuenta fue creada!' })).toBeInTheDocument()
    expect(readMailbox()[0].to).toBe('ana@correo.com')
  })

  it('registro con correo existente resalta el error en el campo', async () => {
    const service = newService()
    await service.register({ firstName: 'A', lastName: 'B', email: 'ana@correo.com', password: 'Ideas2026' })
    renderAt('/registro', service)
    await fillRegister('ana@correo.com')
    expect(await screen.findByText('El correo ingresado ya existe o no es válido')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true')
  })

  it('valida campos obligatorios antes de enviar', async () => {
    renderAt('/registro', newService())
    await userEvent.setup().click(await screen.findByRole('button', { name: /crear mi cuenta/i }))
    expect(screen.getAllByText('Este campo es obligatorio.').length).toBeGreaterThan(0)
    expect(readMailbox()).toHaveLength(0)
  })

  it('login inválido muestra "Credenciales inválidas"', async () => {
    renderAt('/login', newService())
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Correo electrónico'), 'nadie@correo.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Ideas2026')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
  })

  it('login → Inicio → cerrar sesión, y la ruta privada vuelve a pedir login', async () => {
    const service = newService()
    await service.register({ firstName: 'Ana', lastName: 'Cárdenas', email: 'ana@correo.com', password: 'Ideas2026' })
    await service.verifyEmail(readMailbox()[0].link.split('/').pop()!)

    const { unmount } = renderAt('/login', service)
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Correo electrónico'), 'ana@correo.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Ideas2026')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByText(/merece/)).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Cerrar sesión' })[0])
    expect(await screen.findByRole('heading', { name: /una buena idea/i })).toBeInTheDocument()
    unmount()

    renderAt('/app', service)
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
  })

  it('enlace de verificación inválido ofrece reenviar el correo', async () => {
    renderAt('/verificar/token-falso', newService())
    expect(await screen.findByRole('heading', { name: 'Enlace de activación inválido o expirado' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reenviar e-mail de activación' })).toBeInTheDocument()
  })
})
