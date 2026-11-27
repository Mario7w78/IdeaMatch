import { AuthError, VERIFY_CODE_LENGTH } from '../../services/auth'

/** Textos compartidos por las pantallas de acceso. */
export const LOGIN_PANEL = {
  badge: 'Ideas que encuentran equipo',
  title: 'Todo gran proyecto comienza con las personas correctas.',
  subtitle: 'Entra a la comunidad y continúa construyendo algo que importe.',
}

// [HU02-FE] Verificación del correo con código.
/** Estado con el que llegan el registro, el login y la recuperación (el correo no viaja en la URL). */
export interface VerifyCodeState {
  email?: string
  /** true al venir del registro: el código se acaba de enviar. */
  registered?: boolean
  /** true si el código se acaba de pedir (p. ej. desde "Olvidé mi contraseña"). */
  codeSent?: boolean
}

/** Igual que el backend: no reenvía otro código antes de 60 s. */
export const RESEND_COOLDOWN_S = 60

export const CODE_MESSAGES = {
  length: `Ingresa los ${VERIFY_CODE_LENGTH} dígitos del código.`,
  exhausted: 'Superaste los intentos permitidos. Pide un código nuevo.',
  resent: 'Te enviamos un código nuevo. Revisa también la carpeta de spam.',
}

/** Mensaje para un error al validar un código (incluye los intentos restantes). */
export function codeErrorMessage(e: unknown): string {
  if (e instanceof AuthError) {
    if (e.code === 'INVALID_CODE' && e.attemptsLeft === 0) return CODE_MESSAGES.exhausted
    if (e.code === 'INVALID_CODE' && e.attemptsLeft !== undefined)
      return `${e.message} Te ${e.attemptsLeft === 1 ? 'queda 1 intento' : `quedan ${e.attemptsLeft} intentos`}.`
    return e.message
  }
  return e instanceof Error ? e.message : 'No pudimos validar el código. Intenta de nuevo.'
}
