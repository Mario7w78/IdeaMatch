/**
 * Buzón de correos simulado. Mientras no exista backend, los correos de
 * activación y recuperación se guardan aquí para poder probar los flujos.
 */
export interface Mail {
  id: string
  to: string
  subject: string
  body: string
  link: string
  sentAt: string
}

const KEY = 'im.mailbox'
const EVENT = 'im:mailbox'

export function readMailbox(storage: Storage = window.localStorage): Mail[] {
  try {
    return JSON.parse(storage.getItem(KEY) ?? '[]') as Mail[]
  } catch {
    return []
  }
}

export function sendMail(mail: Omit<Mail, 'id' | 'sentAt'>, storage: Storage = window.localStorage) {
  const entry: Mail = { ...mail, id: crypto.randomUUID(), sentAt: new Date().toISOString() }
  storage.setItem(KEY, JSON.stringify([entry, ...readMailbox(storage)].slice(0, 20)))
  window.dispatchEvent(new CustomEvent(EVENT))
}

export function clearMailbox(storage: Storage = window.localStorage) {
  storage.removeItem(KEY)
  window.dispatchEvent(new CustomEvent(EVENT))
}

export function onMailboxChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
