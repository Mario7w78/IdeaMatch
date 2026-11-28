import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MockNotificationService,
  notificationService,
  seedNotifications,
  type MockNotificationStore,
} from '../services/notifications'
import { renderAt, testAuth } from './helpers'

const sessionUser = () => (JSON.parse(localStorage.getItem('im.session') ?? '{}') as { userId?: string }).userId ?? null

/** Cada prueba trabaja con datos nuevos (el servicio real es un singleton). */
function freshMock(store: MockNotificationStore = seedNotifications()) {
  const mock = new MockNotificationService({ store, currentUserId: sessionUser })
  for (const key of ['list', 'markRead', 'markAllRead', 'subscribe', 'onStatus'] as const) {
    vi.spyOn(notificationService, key).mockImplementation(((...args: never[]) =>
      (mock[key] as (...a: never[]) => unknown).apply(mock, args)) as never)
  }
  return mock
}

async function openAs(email: string, path = '/app') {
  const auth = testAuth()
  await auth.login(email, 'Password123')
  renderAt(path, auth)
}

const bell = () => screen.getByRole('button', { name: /^Notificaciones/ })

afterEach(() => vi.restoreAllMocks())

describe('HU31-FE · Alerta en la campana por nueva postulación', () => {
  it('al llegar una postulación sube el contador y muestra «Tienes una nueva postulación para el rol …»', async () => {
    const mock = freshMock()
    await openAs('user1@ideamatch.com')
    expect(await screen.findByRole('button', { name: 'Notificaciones, 2 sin leer' })).toBeInTheDocument()

    act(() => {
      mock.push('user1', 'application_received', { projectId: 'proj-neurobloom', projectName: 'NeuroBloom', roleName: 'QA Tester' })
    })

    expect(await screen.findByRole('button', { name: 'Notificaciones, 3 sin leer' })).toBeInTheDocument()
    expect(screen.getByText('Tienes una nueva postulación para el rol QA Tester')).toBeInTheDocument()
  })

  it('si hay 5 postulaciones sin leer se agrupan: «Tienes 5 postulaciones pendientes»', async () => {
    const neuro = { projectId: 'proj-neurobloom', projectName: 'NeuroBloom' }
    const store: MockNotificationStore = {
      user1: [1, 2, 3, 4, 5].map((i) => ({
        id: `g-${i}`,
        type: 'application_received',
        payload: { ...neuro, roleName: `Rol ${i}` },
        read: false,
        createdAt: new Date(Date.now() - i * 60_000).toISOString(),
      })),
    }
    freshMock(store)
    await openAs('user1@ideamatch.com')
    fireEvent.click(await screen.findByRole('button', { name: 'Notificaciones, 5 sin leer' }))

    const list = within(screen.getByRole('dialog', { name: 'Notificaciones' })).getByRole('list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(1)
    expect(within(list).getByText('Tienes 5 postulaciones pendientes')).toBeInTheDocument()
    expect(within(list).getByRole('link')).toHaveAttribute('href', '/app/proyecto/proj-neurobloom/postulaciones')
  })
})

describe('HU32-FE · Indicador rojo y sincronización', () => {
  it('muestra el indicador rojo con las alertas sin leer de cambio de estado', async () => {
    freshMock()
    await openAs('user2@ideamatch.com')
    await screen.findByRole('button', { name: 'Notificaciones, 2 sin leer' })
    expect(screen.getByTestId('notification-badge')).toHaveTextContent('2')
    expect(screen.getByTestId('notification-badge').className).toContain('bg-danger-600')

    fireEvent.click(bell())
    const panel = screen.getByRole('dialog', { name: 'Notificaciones' })
    expect(within(panel).getByText('Tu postulación para el rol Frontend Developer fue aceptada')).toBeInTheDocument()
    expect(within(panel).getByText('Tu postulación para el rol UX Researcher fue rechazada')).toBeInTheDocument()
  })

  it('al reconectarse trae las alertas que llegaron sin conexión', async () => {
    const mock = freshMock()
    await openAs('user2@ideamatch.com')
    await screen.findByRole('button', { name: 'Notificaciones, 2 sin leer' })

    act(() => mock.setConnection('offline'))
    act(() => {
      mock.push('user2', 'application_rejected', { projectId: 'proj-orbit', projectName: 'Orbit Finance', roleName: 'QA' })
    })
    // Sin conexión no llega en vivo.
    expect(bell()).toHaveAccessibleName('Notificaciones, 2 sin leer')

    act(() => mock.setConnection('online'))
    expect(await screen.findByRole('button', { name: 'Notificaciones, 3 sin leer' })).toBeInTheDocument()
  })
})

describe('HU34-FE · Panel de notificaciones y contador', () => {
  it('«Marcar todas como leídas» deja el contador en cero', async () => {
    freshMock()
    await openAs('user1@ideamatch.com')
    fireEvent.click(await screen.findByRole('button', { name: 'Notificaciones, 2 sin leer' }))

    fireEvent.click(screen.getByRole('button', { name: 'Marcar todas como leídas' }))

    await waitFor(() => expect(bell()).toHaveAccessibleName('Notificaciones'))
    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument()
    expect(screen.getByText('Todo al día')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Marcar todas como leídas' })).toBeDisabled()
    expect(screen.queryByText('Sin leer')).not.toBeInTheDocument()
  })

  it('sin notificaciones muestra «No tienes notificaciones registradas»', async () => {
    freshMock({})
    await openAs('user1@ideamatch.com')
    await waitFor(() => expect(notificationService.list).toHaveBeenCalled())
    fireEvent.click(bell())

    expect(await screen.findByText('No tienes notificaciones registradas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Marcar todas como leídas' })).toBeDisabled()
  })

  it('abrir una notificación la marca como leída y lleva a su pantalla', async () => {
    freshMock()
    await openAs('user2@ideamatch.com')
    fireEvent.click(await screen.findByRole('button', { name: 'Notificaciones, 2 sin leer' }))

    fireEvent.click(screen.getByRole('link', { name: /fue aceptada/ }))

    expect(await screen.findByRole('button', { name: 'Notificaciones, 1 sin leer' })).toBeInTheDocument()
    expect(notificationService.markRead).toHaveBeenCalledWith('n-201')
    expect(screen.queryByRole('dialog', { name: 'Notificaciones' })).not.toBeInTheDocument()
  })

  it('se cierra con Escape', async () => {
    freshMock()
    await openAs('user1@ideamatch.com')
    fireEvent.click(await screen.findByRole('button', { name: 'Notificaciones, 2 sin leer' }))
    expect(screen.getByRole('dialog', { name: 'Notificaciones' })).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Notificaciones' })).not.toBeInTheDocument()
  })
})
