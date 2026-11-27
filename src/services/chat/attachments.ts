/** [HU37-FE] Reglas de adjuntos del chat: PDF o PNG de hasta 10 MB. */

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
export const ALLOWED_ATTACHMENT_TYPES = ['application/pdf', 'image/png'] as const
export const ATTACHMENT_ACCEPT = '.pdf,.png,application/pdf,image/png'
export const INVALID_ATTACHMENT_MESSAGE = 'Formato no permitido o el archivo supera el límite de 10MB'

const EXTENSIONS = ['.pdf', '.png']

/** Devuelve el mensaje de error si el archivo no es válido, o `null` si se puede enviar. */
export function validateAttachment(file: Pick<File, 'name' | 'type' | 'size'>): string | null {
  const name = file.name.toLowerCase()
  const typeOk = (ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(file.type)
    || (!file.type && EXTENSIONS.some((ext) => name.endsWith(ext)))
  if (!typeOk || file.size <= 0 || file.size > MAX_ATTACHMENT_BYTES) return INVALID_ATTACHMENT_MESSAGE
  return null
}

/** «2.4 MB», «850 KB». */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}
