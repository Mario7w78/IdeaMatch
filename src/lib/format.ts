const DAY_MS = 24 * 60 * 60 * 1000

/** «hoy», «hace 3 días», «hace 2 semanas», «hace 3 meses». */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const days = Math.max(0, Math.floor((now - new Date(iso).getTime()) / DAY_MS))
  if (days === 0) return 'hoy'
  if (days === 1) return 'hace 1 día'
  if (days < 14) return `hace ${days} días`
  if (days < 60) return `hace ${Math.floor(days / 7)} semanas`
  return `hace ${Math.floor(days / 30)} meses`
}

/** Iniciales para un avatar («Laura Ríos» → «LR»). */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '')).toUpperCase()
}
