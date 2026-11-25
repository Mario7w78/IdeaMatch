import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHttpAuthService } from '../auth/httpAuthService'
import { HttpCategoriesService } from '../categories/httpCategoriesService'
import { HttpReportsService } from '../reports/httpReportsService'
import { ApiError, tokenStore } from './apiClient'

interface Call {
  url: string
  method: string
  auth: string | null
  body: unknown
}

const calls: Call[] = []

/** Simula `fetch` con una cola de respuestas `[status, json]`. */
function mockFetch(...responses: Array<[number, unknown?]>) {
  const queue = [...responses]
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      const headers = init.headers as Record<string, string>
      calls.push({
        url,
        method: init.method ?? 'GET',
        auth: headers.Authorization ?? null,
        body: init.body ? JSON.parse(init.body as string) : undefined,
      })
      const [status, json] = queue.shift() ?? [500]
      return new Response(json === undefined ? null : JSON.stringify(json), { status })
    }),
  )
}

beforeEach(() => {
  calls.length = 0
  window.localStorage.clear()
})
afterEach(() => vi.unstubAllGlobals())

describe('authService HTTP', () => {
  const apiUser = { id: '9', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@x.com', isAdmin: true, createdAt: '2026-11-01' }

  it('login: guarda el token y traduce isAdmin a role', async () => {
    mockFetch([200, { token: 'jwt-123', user: apiUser }])
    const session = await createHttpAuthService().login('ada@x.com', 'Secreta123')
    expect(session.user.role).toBe('admin')
    expect(session.user.id).toBe('9')
    expect(tokenStore.get()).toBe('jwt-123')
    expect(calls[0]).toMatchObject({ url: '/api/auth/login', method: 'POST', auth: null })
  })

  it('login con credenciales malas: lanza INVALID_CREDENTIALS y no guarda token', async () => {
    mockFetch([401, { code: 'INVALID_CREDENTIALS', message: 'x' }])
    await expect(createHttpAuthService().login('a@x.com', 'mala')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    })
    expect(tokenStore.get()).toBeNull()
  })

  it('getSession: sin token no consulta al servidor; con token válido devuelve la sesión', async () => {
    mockFetch()
    expect(await createHttpAuthService().getSession()).toBeNull()
    expect(calls).toHaveLength(0)

    tokenStore.set('jwt-123')
    mockFetch([200, { user: { ...apiUser, isAdmin: false } }])
    const session = await createHttpAuthService().getSession()
    expect(session?.user.role).toBe('user')
    expect(calls[0].auth).toBe('Bearer jwt-123')
  })

  it('getSession: un 401 limpia el token', async () => {
    tokenStore.set('vencido')
    mockFetch([401, { code: 'UNAUTHORIZED', message: 'x' }])
    expect(await createHttpAuthService().getSession()).toBeNull()
    expect(tokenStore.get()).toBeNull()
  })
})

describe('categoriesService HTTP (HU38)', () => {
  const apiCat = { id: '7', name: 'Agrotech', active: true, projectCount: 2, createdAt: '2026-11-02' }

  beforeEach(() => tokenStore.set('jwt-admin'))

  it('escenario feliz: crea una categoría con el token del administrador', async () => {
    mockFetch([201, { category: apiCat }])
    const created = await new HttpCategoriesService().createCategory({ name: ' Agrotech ', description: '' })
    expect(created).toMatchObject({ id: '7', name: 'Agrotech', active: true, projectsCount: 2 })
    expect(calls[0]).toMatchObject({
      url: '/api/admin/categories',
      method: 'POST',
      auth: 'Bearer jwt-admin',
      body: { name: 'Agrotech' },
    })
  })

  it('escenario alterno: nombre repetido muestra el mensaje de la HU38', async () => {
    mockFetch([409, { code: 'CATEGORY_EXISTS', message: 'x' }])
    await expect(new HttpCategoriesService().createCategory({ name: 'Agrotech', description: '' })).rejects.toMatchObject({
      code: 'NAME_TAKEN',
      message: 'La categoría ingresada ya existe en el sistema.',
    })
  })

  it('inactivar: consulta el estado actual y envía PATCH { active: false }', async () => {
    mockFetch([200, [apiCat]], [200, { category: { ...apiCat, active: false } }])
    const updated = await new HttpCategoriesService().toggleCategoryStatus('7')
    expect(updated.active).toBe(false)
    expect(calls[1]).toMatchObject({ url: '/api/admin/categories/7', method: 'PATCH', body: { active: false } })
  })

  it('un usuario sin permisos recibe el 403 como ApiError', async () => {
    mockFetch([403, { code: 'ADMIN_ONLY', message: 'Solo administradores' }])
    await expect(new HttpCategoriesService().getCategories()).rejects.toBeInstanceOf(ApiError)
  })

  it('no permite eliminar (el backend solo inactiva)', async () => {
    await expect(new HttpCategoriesService().deleteCategory()).rejects.toMatchObject({ code: 'NOT_SUPPORTED' })
  })
})

describe('reportsService HTTP (HU39)', () => {
  const input = {
    projectId: '5',
    projectTitle: 'Proyecto',
    reporterId: '9',
    reporterName: 'Ada',
    cause: 'contenido_enganoso' as const,
    reason: '  Promete cosas falsas  ',
  }

  beforeEach(() => tokenStore.set('jwt-user'))

  it('escenario feliz: envía motivo y descripción al proyecto', async () => {
    mockFetch([201, { report: { id: '3', createdAt: '2026-11-20' } }])
    const report = await new HttpReportsService().createReport(input)
    expect(report).toMatchObject({ id: '3', status: 'pending', reason: 'Promete cosas falsas' })
    expect(calls[0]).toMatchObject({
      url: '/api/projects/5/reports',
      method: 'POST',
      body: { reason: 'contenido_enganoso', description: 'Promete cosas falsas' },
    })
  })

  it('escenario alterno: motivo vacío no llega al servidor', async () => {
    mockFetch()
    await expect(new HttpReportsService().createReport({ ...input, reason: '   ' })).rejects.toThrow('Proporcione un motivo')
    expect(calls).toHaveLength(0)
  })

  it('escenario alterno: reporte repetido', async () => {
    mockFetch([409, { code: 'ALREADY_REPORTED', message: 'x' }])
    await expect(new HttpReportsService().createReport(input)).rejects.toThrow(
      'Ya registraste un reporte para esta publicación',
    )
  })

  it('listReports traduce estados y resoluciones del backend', async () => {
    const base = {
      project: { id: '5', name: 'Proyecto', status: 'abierto' },
      reason: 'spam',
      description: 'd',
      createdAt: '2026-11-20',
      reporter: { id: '9', name: 'Ada' },
    }
    mockFetch([
      200,
      {
        total: 3,
        items: [
          { ...base, id: '1', status: 'abierto', resolution: null, resolvedAt: null, resolvedBy: null },
          { ...base, id: '2', status: 'resuelto', resolution: 'dismiss', resolvedAt: 'x', resolvedBy: { id: '1', name: 'A' } },
          { ...base, id: '3', status: 'resuelto', resolution: 'suspend_project', resolvedAt: 'x', resolvedBy: { id: '1', name: 'A' } },
        ],
      },
    ])
    const list = await new HttpReportsService().listReports()
    expect(list.map((r) => r.status)).toEqual(['pending', 'dismissed', 'resolved'])
    expect(list[2].action).toBe('project_suspended')
  })

  it('suspender envía la acción suspend_project', async () => {
    mockFetch([
      200,
      {
        report: {
          id: '1',
          project: { id: '5', name: 'P', status: 'suspendido' },
          reason: 'spam',
          description: 'd',
          status: 'resuelto',
          resolution: 'suspend_project',
          createdAt: 'x',
          resolvedAt: 'y',
          reporter: { id: '9', name: 'Ada' },
          resolvedBy: { id: '1', name: 'Admin' },
        },
      },
    ])
    const report = await new HttpReportsService().suspendProject('1')
    expect(report.status).toBe('resolved')
    expect(calls[0]).toMatchObject({ url: '/api/admin/reports/1/resolve', body: { action: 'suspend_project' } })
  })
})
