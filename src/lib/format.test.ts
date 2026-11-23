import { describe, expect, it } from 'vitest'
import { initialsOf, timeAgo } from './format'

const NOW = new Date('2026-11-23T12:00:00.000Z').getTime()
const ago = (days: number) => new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString()

describe('format', () => {
  it('timeAgo describe la antigüedad en español', () => {
    expect(timeAgo(ago(0), NOW)).toBe('hoy')
    expect(timeAgo(ago(1), NOW)).toBe('hace 1 día')
    expect(timeAgo(ago(3), NOW)).toBe('hace 3 días')
    expect(timeAgo(ago(21), NOW)).toBe('hace 3 semanas')
    expect(timeAgo(ago(95), NOW)).toBe('hace 3 meses')
  })

  it('initialsOf usa la primera y la última palabra', () => {
    expect(initialsOf('Laura Ríos')).toBe('LR')
    expect(initialsOf('Ana María de la Cruz')).toBe('AC')
    expect(initialsOf('Sofía')).toBe('S')
  })
})
