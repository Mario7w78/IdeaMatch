import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { readMailbox } from '../services/mailbox'
import { reportsService } from '../services/reports'
import { loginAs, renderAt } from './helpers'

describe('HU40 — Panel de moderación para administradores', () => {
  beforeEach(() => {
    localStorage.clear()
    reportsService.reset()
  })

  it('escenario feliz: el administrador suspende un proyecto reportado y se notifica al creador', async () => {
    const auth = await loginAs('admin@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/admin/reports', auth)

    expect(await screen.findByRole('heading', { name: 'Moderación de reportes' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /^Pendientes \(3\)/ })).toBeInTheDocument()
    expect(screen.getByText('Casino online para estudiantes')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Suspender proyecto Casino online para estudiantes' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/se ocultará del público/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar suspensión' }))

    expect(await screen.findByText(/suspendido\. Se notificó a Carlos Pérez/)).toBeInTheDocument()
    expect(screen.queryByText('Casino online para estudiantes')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Pendientes \(2\)/ })).toBeInTheDocument()

    expect(await reportsService.isProjectSuspended('proj-casino')).toBe(true)
    expect(readMailbox()[0].to).toBe('carlos.perez@correo.com')
  })

  it('el administrador puede descartar un reporte y el proyecto sigue visible', async () => {
    const auth = await loginAs('admin@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/admin/reports', auth)

    await user.click(await screen.findByRole('button', { name: 'Descartar reporte de Gana $5000 diarios sin esfuerzo' }))
    expect(await screen.findByText(/Reporte descartado/)).toBeInTheDocument()
    expect(await reportsService.isProjectSuspended('proj-ingresos')).toBe(false)
  })

  it('si el administrador cierra la ventana sin confirmar, no cambia nada', async () => {
    const auth = await loginAs('admin@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/admin/reports', auth)

    await user.click(await screen.findByRole('button', { name: 'Suspender proyecto Casino online para estudiantes' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Casino online para estudiantes')).toBeInTheDocument()
    expect(await reportsService.isProjectSuspended('proj-casino')).toBe(false)
  })

  it('escenario alterno: un usuario común recibe 403 y vuelve al inicio', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    renderAt('/admin/reports', auth)

    expect(await screen.findByRole('alert')).toHaveTextContent('403 Forbidden')
    expect(screen.getByRole('heading', { name: /Tu próxima gran idea/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Moderación de reportes' })).not.toBeInTheDocument()
  })

  it('el acceso a Administración solo aparece en el menú del administrador', async () => {
    const admin = await loginAs('admin@ideamatch.com')
    const { unmount } = renderAt('/app', admin)
    expect(await screen.findByRole('link', { name: 'Administración' })).toHaveAttribute('href', '/admin/reports')
    unmount()

    const common = await loginAs('user1@ideamatch.com')
    renderAt('/app', common)
    await screen.findByRole('link', { name: 'Contribuciones' })
    expect(screen.queryByRole('link', { name: 'Administración' })).not.toBeInTheDocument()
  })
})
