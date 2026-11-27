import type { CSSProperties } from 'react'
import type { ChatProjectRef, ChatProjectStatus } from '../../services/chat'

const pad = (n: number) => String(n).padStart(2, '0')

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** Días calendario entre `iso` y `now` (0 = hoy, 1 = ayer). */
export function daysBetween(iso: string, now: Date = new Date()): number {
  return Math.round((startOfDay(now) - startOfDay(new Date(iso))) / 86_400_000)
}

/** «09:42». */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Hora para la lista de conversaciones: «09:42», «Ayer» o «24/11». */
export function formatListTime(iso: string, now: Date = new Date()): string {
  const days = daysBetween(iso, now)
  if (days <= 0) return formatTime(iso)
  if (days === 1) return 'Ayer'
  const d = new Date(iso)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}

/** Separador de día en el chat: «Hoy», «Ayer» o «lunes, 24 de noviembre». */
export function dayLabel(iso: string, now: Date = new Date()): string {
  const days = daysBetween(iso, now)
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  return new Date(iso).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** «Ne» para la lista (como en el diseño) a partir del nombre del proyecto. */
export function projectAvatarLabel(project: Pick<ChatProjectRef, 'name' | 'initials'>, variant: 'list' | 'header'): string {
  if (variant === 'header' && project.initials.length >= 2) return project.initials
  const name = project.name.trim()
  return `${name.charAt(0).toUpperCase()}${name.charAt(1).toLowerCase()}`
}

/** Fondo suave con el color de portada del proyecto (dato del backend). */
export function projectTint(coverColor?: string): CSSProperties | undefined {
  if (!coverColor || !/^#[0-9a-f]{6}$/i.test(coverColor)) return undefined
  return { backgroundColor: `${coverColor}2e`, color: coverColor }
}

const STATUS_LABEL: Record<ChatProjectStatus, string> = {
  borrador: 'Borrador',
  abierto: 'Abierto',
  en_curso: 'En curso',
  pausado: 'Pausado',
  cerrado: 'Cerrado',
  cancelado: 'Cancelado',
  suspendido: 'Suspendido',
}

export const statusLabel = (s: ChatProjectStatus) => STATUS_LABEL[s] ?? s

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name
