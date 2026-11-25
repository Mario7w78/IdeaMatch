/**
 * Cliente HTTP del backend real. Solo se usa cuando existe `VITE_API_URL`;
 * sin ella la app sigue con los servicios simulados (modo mock-first).
 */

const TOKEN_KEY = 'im.api.token'

/** URL base del backend, sin barra final. Vacía = modo simulado. */
export const API_URL: string = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/+$/, '')

export const isApiEnabled = (): boolean => API_URL !== ''

export const tokenStore = {
  get(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    window.localStorage.setItem(TOKEN_KEY, token)
  },
  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* sin almacenamiento disponible */
    }
  },
}

/** Error devuelto por el backend con la forma `{ code, message, details? }`. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | undefined>
  /** Sin token (login, registro, catálogos públicos). */
  auth?: boolean
  signal?: AbortSignal
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, auth = true, signal } = opts
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== '') params.set(k, String(v))
  }
  const qs = params.toString()
  const url = `${API_URL}/api${path}${qs ? `?${qs}` : ''}`

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? tokenStore.get() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch {
    throw new ApiError(0, 'NETWORK', 'No se pudo conectar con el servidor. Inténtalo de nuevo.')
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : undefined
  } catch {
    data = undefined
  }

  if (!res.ok) {
    const err = (data ?? {}) as { code?: string; message?: string; details?: unknown }
    // Token vencido o revocado: se limpia para que la app vuelva a pedir sesión.
    if (res.status === 401 && auth) tokenStore.clear()
    throw new ApiError(res.status, err.code ?? 'HTTP_ERROR', err.message ?? `Error ${res.status}`, err.details)
  }
  return data as T
}
