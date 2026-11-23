import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { contributionsService } from '../services/contributions'
import { loginAs, renderAt } from './helpers'

describe('HU43 — Asociación de contribuciones externas', () => {
  beforeEach(() => {
    localStorage.clear()
    contributionsService.reset()
  })

  it('escenario feliz: la contribución asociada queda pendiente y el creador la valida', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/app/contribuciones', auth)

    expect(await screen.findByRole('heading', { name: 'Contribuciones' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /^Pendientes \(2\)/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Pull request #14: ruta de bicicletas en el mapa')).toBeInTheDocument()
    expect(screen.getAllByText('Pendiente de validación')).toHaveLength(2)

    await user.click(
      screen.getByRole('button', { name: 'Validar contribución: Pull request #14: ruta de bicicletas en el mapa' }),
    )

    expect(await screen.findByText('Contribución validada. Ahora aparece en el perfil de User 2.')).toBeInTheDocument()
    expect(screen.queryByText('Pull request #14: ruta de bicicletas en el mapa')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Pendientes \(1\)/ })).toBeInTheDocument()

    const validated = await contributionsService.listValidatedForUser('user2')
    expect(validated.map((c) => c.id)).toContain('con-1')
  })

  it('escenario alterno: un evento sin cuenta coincidente se muestra como «No asociada» sin afectar a otros', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    const user = userEvent.setup()
    await contributionsService.receiveExternalEvent({
      projectId: 'proj-ecoruta',
      tool: 'github',
      actorEmail: 'desconocido@correo.com',
      summary: 'Commit a1b2c3: corrige el mapa',
    })
    renderAt('/app/contribuciones', auth)

    // Las pendientes de otros colaboradores siguen igual.
    expect(await screen.findByRole('button', { name: /^Pendientes \(2\)/ })).toBeInTheDocument()
    expect(screen.queryByText('Commit a1b2c3: corrige el mapa')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'No asociadas' }))
    expect(await screen.findByText('Commit a1b2c3: corrige el mapa')).toBeInTheDocument()
    expect(screen.getAllByText('No asociada').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Sin cuenta asociada/).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /^Validar contribución/ })).not.toBeInTheDocument()
  })

  it('el creador puede rechazar una contribución pendiente', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/app/contribuciones', auth)

    await user.click(await screen.findByRole('button', { name: 'Rechazar contribución: Prototipo de la pantalla de siembra' }))
    expect(await screen.findByText('Contribución rechazada.')).toBeInTheDocument()
    expect(await contributionsService.listValidatedForUser('user2')).toHaveLength(1)
  })

  it('quien no es creador de ningún proyecto ve el estado vacío', async () => {
    const auth = await loginAs('user2@ideamatch.com')
    renderAt('/app/contribuciones', auth)
    expect(await screen.findByText('No tienes contribuciones pendientes de validación.')).toBeInTheDocument()
  })
})
