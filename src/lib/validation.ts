export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export interface PasswordChecks {
  length: boolean
  uppercase: boolean
  number: boolean
}

export function checkPassword(value: string): PasswordChecks {
  return {
    length: value.length >= 8,
    uppercase: /[A-ZÁÉÍÓÚÑ]/.test(value),
    number: /\d/.test(value),
  }
}

/** Contraseña válida: mínimo 8 caracteres, una mayúscula y un número. */
export function isValidPassword(value: string): boolean {
  const c = checkPassword(value)
  return c.length && c.uppercase && c.number
}

/** Puntaje de 0 a 4 para el medidor de fortaleza. */
export function passwordScore(value: string): number {
  if (!value) return 0
  const c = checkPassword(value)
  let score = [c.length, c.uppercase, c.number].filter(Boolean).length
  if (c.length && c.uppercase && c.number && (value.length >= 12 || /[^A-Za-z0-9]/.test(value))) {
    score += 1
  }
  return Math.max(1, score)
}

export const MESSAGES = {
  required: 'Este campo es obligatorio.',
  email: 'Ingresa un correo válido, por ejemplo nombre@correo.com.',
  password: 'Usa al menos 8 caracteres, una mayúscula y un número.',
  passwordMismatch: 'Las contraseñas no coinciden.',
  terms: 'Acepta los Términos de uso y la Política de privacidad para continuar.',
} as const
