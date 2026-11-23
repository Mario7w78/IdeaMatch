import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../App'
import { AuthProvider } from '../context/AuthContext'
import type { AuthService } from '../services/auth'
import { createMockAuthService } from '../services/auth/mockAuthService'
import { applicationService } from '../services/applications'

function renderAt(path: string, authService: AuthService) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider service={authService}>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Sprint 1 — Gestión de Postulaciones del Colaborador (HU21 a HU24)', () => {
  let authService: AuthService

  beforeEach(() => {
    localStorage.clear()
    applicationService.reset()
    authService = createMockAuthService({ delayMs: 0, origin: 'http://localhost' })
  })

  describe('HU24: Panel "Mis Postulaciones" (Colaborador)', () => {
    it('Escenario Feliz: muestra la tabla con proyecto, rol, fecha y estado para usuario con postulaciones', async () => {
      // Mariana Soto (user1) tiene 6 postulaciones en seed data
      await authService.login('user1@ideamatch.com', 'Password123')
      renderAt('/app/postulaciones', authService)

      // Encabezado de la página
      expect(await screen.findByRole('heading', { name: 'Mis postulaciones' })).toBeInTheDocument()

      // Métricas (MisPostulaciones2.png)
      expect(screen.getByText('Enviadas')).toBeInTheDocument()
      expect(screen.getAllByText('En revisión').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Aceptada').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Finalizadas')).toBeInTheDocument()

      // Proyectos en la tabla
      expect(screen.getByText('NeuroBloom')).toBeInTheDocument()
      expect(screen.getByText('Verde Cerca')).toBeInTheDocument()
      expect(screen.getByText('Orbit Finance')).toBeInTheDocument()

      // Roles y Estados
      expect(screen.getAllByText('Product Designer').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('UX Researcher')).toBeInTheDocument()
      expect(screen.getAllByText('Aceptada').length).toBeGreaterThanOrEqual(1)
    })

    it('Escenario Alterno: muestra el estado vacío oficial cuando el usuario no tiene postulaciones', async () => {
      // Daniel Torres (user2) no tiene postulaciones registradas
      await authService.login('user2@ideamatch.com', 'Password123')
      renderAt('/app/postulaciones', authService)

      expect(await screen.findByRole('heading', { name: 'Mis postulaciones' })).toBeInTheDocument()

      // Mensaje de estado vacío de HU24 y Figma MisPostulaciones1.png
      expect(
        screen.getByText(/Aún no has enviado postulaciones\. ¡Explora proyectos aquí!/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/No has enviado ninguna postulación/i),
      ).toBeInTheDocument()

      // Botón CTA para explorar proyectos
      const exploreBtn = screen.getByRole('link', { name: /explorar proyectos/i })
      expect(exploreBtn).toBeInTheDocument()
      expect(exploreBtn).toHaveAttribute('href', '/app/explorar')
    })
  })

  describe('HU21: Enviar Postulación a un Rol Específico', () => {
    it('Escenario Feliz: envía postulación con nota válida y pasa a estado Pendiente (En revisión)', async () => {
      await authService.login('user2@ideamatch.com', 'Password123')
      const userEvt = userEvent.setup()
      renderAt('/app/postulaciones', authService)

      // Abrir modal de postulación
      const newAppBtn = await screen.findByRole('button', { name: /nueva postulación/i })
      await userEvt.click(newAppBtn)

      expect(await screen.findByRole('heading', { name: /enviar postulación a un rol/i })).toBeInTheDocument()

      // Escribir nota de presentación
      const noteInput = screen.getByLabelText(/nota de presentación/i)
      await userEvt.type(noteInput, 'Hola, me encanta la iniciativa de NeuroBloom y quiero aportar con diseño.')

      // Enviar
      const submitBtn = screen.getByRole('button', { name: /^postular$/i })
      expect(submitBtn).toBeEnabled()
      await userEvt.click(submitBtn)

      // Verificar que el estado pasa a Pendiente ("En revisión") en la tabla
      await waitFor(() => {
        expect(screen.getByText('¡Postulación enviada con éxito! El creador del proyecto ha sido notificado.')).toBeInTheDocument()
      })
      expect(screen.getByText('NeuroBloom')).toBeInTheDocument()
      expect(screen.getAllByText('En revisión').length).toBeGreaterThanOrEqual(1)
    })

    it('Escenario Alterno: bloquea postulación si el rol no tiene vacantes disponibles', async () => {
      await authService.login('user2@ideamatch.com', 'Password123')
      const userEvt = userEvent.setup()
      renderAt('/app/postulaciones', authService)

      const newAppBtn = await screen.findByRole('button', { name: /nueva postulación/i })
      await userEvt.click(newAppBtn)

      // Seleccionar el rol que tiene 0 vacantes ("Data Analyst")
      const roleSelect = screen.getByLabelText(/rol vacante/i)
      await userEvt.selectOptions(roleSelect, 'role-nb-exhausted')

      // Verificar alerta exacta de HU21
      expect(
        await screen.findByText('El rol seleccionado ya ha cubierto todas sus vacantes.'),
      ).toBeInTheDocument()

      // El botón de enviar debe estar deshabilitado
      const submitBtn = screen.getByRole('button', { name: /^postular$/i })
      expect(submitBtn).toBeDisabled()
    })
  })

  describe('HU22: Restricción de Múltiples Postulaciones', () => {
    it('Escenario Feliz: botón activo y habilitado cuando no se ha postulado previamente', async () => {
      await authService.login('user2@ideamatch.com', 'Password123')
      const userEvt = userEvent.setup()
      renderAt('/app/postulaciones', authService)

      const newAppBtn = await screen.findByRole('button', { name: /nueva postulación/i })
      await userEvt.click(newAppBtn)

      // Al no haber postulado, no hay alerta de duplicidad y el botón se activa al escribir la nota
      expect(screen.queryByText('Ya cuentas con una postulación registrada para este proyecto.')).not.toBeInTheDocument()
      const noteInput = screen.getByLabelText(/nota de presentación/i)
      await userEvt.type(noteInput, 'Nota suficiente para postular.')

      const submitBtn = screen.getByRole('button', { name: /^postular$/i })
      expect(submitBtn).toBeEnabled()
    })

    it('Escenario Alterno: bloquea nueva postulación si ya tiene una registrada para ese proyecto', async () => {
      await authService.login('user2@ideamatch.com', 'Password123')
      const userEvt = userEvent.setup()
      renderAt('/app/postulaciones', authService)

      // 1. Enviar primera postulación a NeuroBloom
      const newAppBtn = await screen.findByRole('button', { name: /nueva postulación/i })
      await userEvt.click(newAppBtn)
      const noteInput = screen.getByLabelText(/nota de presentación/i)
      await userEvt.type(noteInput, 'Primera postulación registrada.')
      await userEvt.click(screen.getByRole('button', { name: /^postular$/i }))

      await waitFor(() => {
        expect(screen.getByText(/¡Postulación enviada con éxito!/i)).toBeInTheDocument()
      })

      // 2. Intentar postular de nuevo a NeuroBloom
      await userEvt.click(screen.getByRole('button', { name: /nueva postulación/i }))

      // Verificar alerta exacta de HU22
      expect(
        await screen.findByText('Ya cuentas con una postulación registrada para este proyecto.'),
      ).toBeInTheDocument()

      // Botón debe estar deshabilitado
      const submitBtn = screen.getByRole('button', { name: /^postular$/i })
      expect(submitBtn).toBeDisabled()
    })
  })

  describe('HU23: Cancelación de Postulación Enviada', () => {
    it('Escenario Feliz: cancela una postulación en estado Pendiente y pasa a "Cancelada por Colaborador"', async () => {
      await authService.login('user1@ideamatch.com', 'Password123')
      const userEvt = userEvent.setup()
      renderAt('/app/postulaciones', authService)

      // Localizar la fila de NeuroBloom (app-mb-1, estado PENDING)
      const row = await screen.findByTestId('app-row-app-mb-1')
      expect(row).toBeInTheDocument()
      const cancelBtn = within(row).getByRole('button', { name: /cancelar/i })
      await userEvt.click(cancelBtn)

      // Modal de confirmación abierto
      expect(await screen.findByRole('heading', { name: 'Cancelar postulación' })).toBeInTheDocument()
      expect(screen.getAllByText(/Cancelada por Colaborador/i).length).toBeGreaterThanOrEqual(1)

      // Confirmar cancelación
      const confirmBtn = screen.getByRole('button', { name: /confirmar cancelación/i })
      await userEvt.click(confirmBtn)

      // Mensaje de éxito y badge actualizado
      await waitFor(() => {
        expect(screen.getByText(/ha sido cancelada exitosamente/i)).toBeInTheDocument()
      })
      expect(screen.getAllByText(/Cancelada por Colaborador/i).length).toBeGreaterThanOrEqual(1)
    })

    it('Escenario Alterno: no se puede cancelar una postulación que ya ha sido procesada por el creador', async () => {
      await authService.login('user1@ideamatch.com', 'Password123')
      const userEvt = userEvent.setup()
      renderAt('/app/postulaciones', authService)

      // app-mb-3 es Verde Cerca (Aceptada / Procesada)
      const row = await screen.findByTestId('app-row-app-mb-3')
      expect(row).toBeInTheDocument()

      // Las postulaciones procesadas no muestran el botón directo de cancelar
      expect(within(row).queryByRole('button', { name: /^cancelar$/i })).not.toBeInTheDocument()

      // Al ver el detalle, tampoco permite cancelar
      const viewDetailBtn = within(row).getByRole('button', { name: /ver detalle/i })
      await userEvt.click(viewDetailBtn)

      expect(await screen.findByRole('heading', { name: 'Verde Cerca' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /cancelar postulación/i })).not.toBeInTheDocument()
    })
  })
})
