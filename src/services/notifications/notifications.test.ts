import { describe, expect, it, vi } from 'vitest'
import { buildEntries, notificationLink, notificationText, relativeTime } from './format'
import { httpNotificationService } from './httpNotificationService'
import { MockNotificationService, seedNotifications } from './mockNotificationService'
import type { AppNotification } from './types'

const received = (id: string, roleName: string, minutesAgo = 1, read = false): AppNotification => ({
  id,
  type: 'application_received',
  payload: { projectId: 'p1', projectName: 'NeuroBloom', roleName },
  read,
  createdAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
})

describe('[HU31-FE] Textos y agrupación', () => {
  it('muestra el mensaje de nueva postulación con el nombre del rol', () => {
    expect(notificationText(received('1', 'Data Analyst'))).toBe('Tienes una nueva postulación para el rol Data Analyst')
    expect(notificationLink(received('1', 'X'))).toBe('/app/proyecto/p1/postulaciones')
  })

  it('agrupa 5 postulaciones sin leer en un solo aviso', () => {
    const items = [1, 2, 3, 4, 5].map((i) => received(String(i), `Rol ${i}`, i))
    const entries = buildEntries(items)
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ text: 'Tienes 5 postulaciones pendientes', grouped: true, ids: ['1', '2', '3', '4', '5'] })
  })

  it('con menos de 5 (o ya leídas) no agrupa', () => {
    const four = [1, 2, 3, 4].map((i) => received(String(i), `Rol ${i}`, i))
    expect(buildEntries(four)).toHaveLength(4)
    const withRead = [...four, received('5', 'Rol 5', 5, true)]
    expect(buildEntries(withRead).every((e) => !e.grouped)).toBe(true)
  })
})

describe('[HU32-FE] Textos de estado', () => {
  it('distingue aceptada y rechazada', () => {
    const base = { payload: { roleName: 'QA' }, read: false, createdAt: new Date().toISOString() }
    expect(notificationText({ ...base, id: 'a', type: 'application_accepted' })).toBe('Tu postulación para el rol QA fue aceptada')
    expect(notificationText({ ...base, id: 'r', type: 'application_rejected' })).toBe('Tu postulación para el rol QA fue rechazada')
    expect(notificationText({ ...base, id: 'x', type: 'otro_tipo' })).toBe('Tienes una nueva notificación')
  })

  it('formatea el tiempo relativo', () => {
    const now = Date.now()
    expect(relativeTime(new Date(now).toISOString(), now)).toBe('Ahora')
    expect(relativeTime(new Date(now - 5 * 60_000).toISOString(), now)).toBe('Hace 5 min')
    expect(relativeTime(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe('Hace 3 h')
  })
})

describe('[HU34-FE] Servicio simulado', () => {
  it('lista solo las del usuario actual y «marcar todas» deja el contador en cero', async () => {
    const svc = new MockNotificationService({ store: seedNotifications(), currentUserId: () => 'user1' })
    const before = await svc.list()
    expect(before.unreadCount).toBe(2)
    await svc.markAllRead()
    expect((await svc.list()).unreadCount).toBe(0)
  })

  it('un usuario sin notificaciones recibe una lista vacía', async () => {
    const svc = new MockNotificationService({ store: {}, currentUserId: () => 'nuevo' })
    expect(await svc.list()).toEqual({ unreadCount: 0, items: [] })
  })

  it('solo entrega en vivo si hay conexión; si no, quedan para sincronizar', async () => {
    const svc = new MockNotificationService({ store: {}, currentUserId: () => 'user1' })
    const live = vi.fn()
    svc.subscribe(live)
    svc.setConnection('offline')
    svc.push('user1', 'application_accepted', { roleName: 'QA' })
    expect(live).not.toHaveBeenCalled()
    expect((await svc.list()).unreadCount).toBe(1)
    svc.setConnection('online')
    svc.push('user1', 'application_rejected', { roleName: 'QA' })
    expect(live).toHaveBeenCalledTimes(1)
  })
})

describe('[HU34-FE] Servicio HTTP', () => {
  it('llama a los endpoints del contrato', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    await httpNotificationService.markAllRead()
    await httpNotificationService.markRead('n 1')
    const urls = fetchMock.mock.calls.map((c) => String((c as unknown[])[0]))
    expect(urls[0]).toMatch(/\/api\/notifications\/read-all$/)
    expect(urls[1]).toMatch(/\/api\/notifications\/n%201\/read$/)
    vi.unstubAllGlobals()
  })
})
