import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { categoriesService } from '../services/categories'
import { reportsService } from '../services/reports'
import { loginAs, renderAt } from './helpers'

describe('HU38-FE · Panel de categorías (Frontend)', () => {
  beforeEach(() => {
    localStorage.clear()
    categoriesService.reset()
  })

  it('renderiza la pantalla de categorías con el catálogo base', async () => {
    const auth = await loginAs('admin@ideamatch.com')
    renderAt('/admin/categories', auth)

    expect(await screen.findByRole('heading', { name: 'Gestión de Categorías' })).toBeInTheDocument()
    expect(await screen.findByText('Inteligencia Artificial')).toBeInTheDocument()
    expect(screen.getByText('Fintech & Finanzas')).toBeInTheDocument()
  })

  it('permite abrir el modal y crear una nueva categoría exitosamente', async () => {
    const auth = await loginAs('admin@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/admin/categories', auth)

    await screen.findByText('Inteligencia Artificial')
    await user.click(screen.getByRole('button', { name: /nueva categoría/i }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText(/nombre de la categoría/i), 'Biotecnología')
    await user.type(
      within(dialog).getByLabelText(/^descripción/i),
      'Innovaciones biológicas y genéticas.',
    )

    await user.click(within(dialog).getByRole('button', { name: /crear categoría/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    expect(await screen.findByText('Biotecnología')).toBeInTheDocument()
  })

  it('muestra el mensaje exacto al intentar un nombre repetido: «La categoría ingresada ya existe en el sistema»', async () => {
    const auth = await loginAs('admin@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/admin/categories', auth)

    await screen.findByText('Inteligencia Artificial')
    await user.click(screen.getByRole('button', { name: /nueva categoría/i }))

    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/nombre de la categoría/i), 'Inteligencia Artificial')
    await user.type(within(dialog).getByLabelText(/^descripción/i), 'Intento duplicado')

    await user.click(within(dialog).getByRole('button', { name: /crear categoría/i }))

    expect(
      await within(dialog).findByText('La categoría ingresada ya existe en el sistema.'),
    ).toBeInTheDocument()
  })
})

describe('HU39-FE · Botón y formulario de reporte (Frontend)', () => {
  beforeEach(() => {
    localStorage.clear()
    reportsService.reset()
  })

  it('valida motivo vacío mostrando el mensaje: «Proporcione un motivo»', async () => {
    const auth = await loginAs('admin@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/admin/reports', auth)

    await user.click(await screen.findByRole('button', { name: /reportar publicación/i }))
    const dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: /enviar reporte/i }))

    expect(await within(dialog).findByText('Proporcione un motivo')).toBeInTheDocument()
  })

  it('permite enviar un reporte exitoso con motivo y causa', async () => {
    const auth = await loginAs('admin@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/admin/reports', auth)

    await user.click(await screen.findByRole('button', { name: /reportar publicación/i }))
    const dialog = await screen.findByRole('dialog')

    await user.type(
      within(dialog).getByLabelText(/motivo detallado/i),
      'El proyecto solicita depósitos sospechosos sin respaldo.',
    )
    await user.click(within(dialog).getByRole('button', { name: /enviar reporte/i }))

    expect(await within(dialog).findByText('¡Reporte enviado!')).toBeInTheDocument()
  })

  it('muestra el mensaje exacto al intentar un reporte repetido: «Ya registraste un reporte para esta publicación»', async () => {
    await reportsService.createReport({
      projectId: 'proj-demo-report',
      projectTitle: 'Publicación de Prueba',
      reporterId: 'admin1',
      reporterName: 'Admin Principal',
      cause: 'spam',
      reason: 'Primer reporte registrado',
    })

    const auth = await loginAs('admin@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/admin/reports', auth)

    await user.click(await screen.findByRole('button', { name: /reportar publicación/i }))
    const dialog = await screen.findByRole('dialog')

    await user.type(
      within(dialog).getByLabelText(/motivo detallado/i),
      'Segundo reporte para el mismo proyecto',
    )
    await user.click(within(dialog).getByRole('button', { name: /enviar reporte/i }))

    expect(
      await within(dialog).findByText('Ya registraste un reporte para esta publicación'),
    ).toBeInTheDocument()
  })
})
