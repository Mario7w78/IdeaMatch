import { describe, expect, it } from 'vitest'
import { isValidEmail, isValidPassword, passwordScore } from './validation'

describe('validación', () => {
  it('rechaza correos sin @ o sin dominio', () => {
    expect(isValidEmail('ana@correo.com')).toBe(true)
    expect(isValidEmail('anacorreo.com')).toBe(false)
    expect(isValidEmail('ana@correo')).toBe(false)
  })

  it('exige 8 caracteres, una mayúscula y un número', () => {
    expect(isValidPassword('Ideas2026')).toBe(true)
    expect(isValidPassword('ideas2026')).toBe(false)
    expect(isValidPassword('Ideas')).toBe(false)
    expect(isValidPassword('IdeasMatch')).toBe(false)
  })

  it('calcula la fortaleza de 0 a 4', () => {
    expect(passwordScore('')).toBe(0)
    expect(passwordScore('abc')).toBe(1)
    expect(passwordScore('Ideas2026')).toBe(3)
    expect(passwordScore('Ideas2026!')).toBe(4)
  })
})
