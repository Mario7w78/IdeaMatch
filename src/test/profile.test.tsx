import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../App'
import { AuthProvider } from '../context/AuthContext'
import type { AuthService } from '../services/auth'
import { createMockAuthService } from '../services/auth/mockAuthService'
import { clearMailbox, readMailbox } from '../services/mailbox'
import { profileService } from '../services/profile'

function renderAt(path: string, authService: AuthService) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider service={authService}>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
}

async function createAndLogin(
  auth: AuthService,
  firstName: string,
  lastName: string,
  email: string,
) {
  clearMailbox()
  const user = await auth.register({
    firstName,
    lastName,
    email,
    password: 'Password123',
  })
  const [mail] = readMailbox()
  const token = mail.link.split('/verificar/')[1]
  await auth.verifyEmail(token)
  await auth.login(email, 'Password123')
  return user
}

describe('Sprint 2 — Perfil del Colaborador (HU06 a HU10)', () => {
  let authService: AuthService

  beforeEach(() => {
    localStorage.clear()
    profileService.reset()
    authService = createMockAuthService({ delayMs: 0, origin: 'http://localhost' })
  })

  it('HU06 & HU09: renderiza "Mi perfil" en estado incompleto y permite editar datos', async () => {
    await createAndLogin(authService, 'Daniel', 'Torres', 'daniel@correo.com')

    const userEvt = userEvent.setup()
    renderAt('/app/perfil', authService)

    // Verificar nombre y estado incompleto inicial (Perfil1.png)
    expect(await screen.findByRole('heading', { name: 'Daniel Torres' })).toBeInTheDocument()
    expect(screen.getByText('Perfil sin completar')).toBeInTheDocument()
    expect(screen.getByText('Aún no has agregado una biografía.')).toBeInTheDocument()
    expect(screen.getByText('Sin definir')).toBeInTheDocument()

    // Botón para completar perfil
    const editBtn = screen.getByRole('button', { name: /completar perfil/i })
    expect(editBtn).toBeInTheDocument()
    await userEvt.click(editBtn)

    // Modal abierto: editar ocupación, ubicación y bio
    expect(await screen.findByRole('heading', { name: 'Editar perfil' })).toBeInTheDocument()
    const occupationInput = screen.getByLabelText('Ocupación o rol profesional')
    await userEvt.clear(occupationInput)
    await userEvt.type(occupationInput, 'Frontend Developer')

    const locationInput = screen.getByLabelText('Ubicación')
    await userEvt.clear(locationInput)
    await userEvt.type(locationInput, 'Lima, Perú')

    const bioInput = screen.getByLabelText('Sobre mí')
    await userEvt.clear(bioInput)
    await userEvt.type(bioInput, 'Desarrollador apasionado por React.')

    // Guardar cambios
    await userEvt.click(screen.getByRole('button', { name: /guardar cambios/i }))

    // Validar que se actualizaron los datos en pantalla
    await waitFor(() => {
      expect(screen.getByText('Frontend Developer · Lima, Perú')).toBeInTheDocument()
    })
    expect(screen.getByText('Desarrollador apasionado por React.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /editar perfil/i })).toBeInTheDocument()
  })

  it('HU07: permite agregar habilidades y visualizarlas como chips en el perfil', async () => {
    await createAndLogin(authService, 'Daniel', 'Torres', 'daniel@correo.com')

    const userEvt = userEvent.setup()
    renderAt('/app/perfil', authService)

    expect(await screen.findByRole('heading', { name: 'Daniel Torres' })).toBeInTheDocument()
    expect(screen.getByText('Sin habilidades agregadas')).toBeInTheDocument()

    // Abrir modal
    await userEvt.click(screen.getByRole('button', { name: /completar perfil/i }))
    expect(await screen.findByRole('heading', { name: 'Editar perfil' })).toBeInTheDocument()

    // Agregar habilidad desde sugerencia o input
    const skillInput = screen.getByPlaceholderText('Agregar habilidad…')
    await userEvt.type(skillInput, 'React')
    await userEvt.click(screen.getByRole('button', { name: 'Agregar' }))

    await userEvt.type(skillInput, 'TypeScript')
    await userEvt.click(screen.getByRole('button', { name: 'Agregar' }))

    // Guardar
    await userEvt.click(screen.getByRole('button', { name: /guardar cambios/i }))

    // Validar chips en la pantalla de perfil
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument()
    })
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.queryByText('Sin habilidades agregadas')).not.toBeInTheDocument()
  })

  it('HU08: muestra enlaces profesionales a Portfolio, LinkedIn y GitHub con enlace externo', async () => {
    await createAndLogin(authService, 'Mariana', 'Soto', 'mariana@correo.com')

    renderAt('/app/perfil/usr-mariana', authService)

    expect(await screen.findByRole('heading', { name: 'Mariana Soto' })).toBeInTheDocument()
    expect(screen.getByText('Diseñadora de producto · Bogotá, Colombia')).toBeInTheDocument()

    // Validar enlaces externos
    const portfolioLink = screen.getByRole('link', { name: /portfolio/i })
    expect(portfolioLink).toHaveAttribute('href', 'https://marianasoto.design')

    const linkedinLink = screen.getByRole('link', { name: /linkedin/i })
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/marianasoto')

    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink).toHaveAttribute('href', 'https://github.com/marianasoto')
  })

  it('HU10: la vista pública de otro usuario no muestra el botón "Editar perfil"', async () => {
    await createAndLogin(authService, 'Daniel', 'Torres', 'daniel@correo.com')

    // Daniel Torres navega a la vista pública de Mariana Soto
    renderAt('/app/perfil/usr-mariana', authService)

    expect(await screen.findByRole('heading', { name: 'Mariana Soto' })).toBeInTheDocument()
    expect(screen.getByText('Diseñadora de producto · Bogotá, Colombia')).toBeInTheDocument()
    expect(screen.getByText('10–15 h / semana')).toBeInTheDocument()

    // NO debe existir botón para editar perfil
    expect(screen.queryByRole('button', { name: /editar perfil/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /completar perfil/i })).not.toBeInTheDocument()
  })

  it('HU10: muestra vista 404 de "Usuario no encontrado" si el id no existe', async () => {
    await createAndLogin(authService, 'Daniel', 'Torres', 'daniel@correo.com')

    renderAt('/app/perfil/usuario-inexistente', authService)

    expect(await screen.findByRole('heading', { name: 'Usuario no encontrado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toBeInTheDocument()
  })
})
