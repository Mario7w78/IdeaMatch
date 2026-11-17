import { Inbox, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearMailbox, onMailboxChange, readMailbox, type Mail } from '../services/mailbox'

/**
 * Solo en desarrollo: muestra los correos "enviados" por el servicio simulado
 * para poder abrir los enlaces de activación y de recuperación.
 */
export function DevMailbox() {
  const [mails, setMails] = useState<Mail[]>(() => readMailbox())
  const [open, setOpen] = useState(false)

  useEffect(() => onMailboxChange(() => setMails(readMailbox())), [])

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <section
          aria-label="Buzón de pruebas"
          className="w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-white shadow-xl"
        >
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Buzón de pruebas</h2>
              <p className="text-xs text-muted">Correos simulados (sin backend)</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => clearMailbox()}
                className="rounded-lg p-2 text-muted hover:bg-surface"
                aria-label="Vaciar buzón"
                title="Vaciar buzón"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted hover:bg-surface"
                aria-label="Cerrar buzón"
              >
                <X size={16} />
              </button>
            </div>
          </header>
          <ul className="max-h-80 divide-y divide-line overflow-y-auto">
            {mails.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">Sin correos todavía.</li>}
            {mails.map((m) => {
              const path = new URL(m.link).pathname
              return (
                <li key={m.id} className="px-4 py-3">
                  <p className="text-xs text-muted">Para: {m.to}</p>
                  <p className="mt-0.5 text-sm font-semibold">{m.subject}</p>
                  <p className="mt-1 text-xs text-muted">{m.body}</p>
                  <Link
                    to={path}
                    onClick={() => setOpen(false)}
                    className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline"
                  >
                    Abrir enlace
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white shadow-lg hover:bg-ink-soft"
        aria-expanded={open}
      >
        <Inbox size={16} aria-hidden="true" />
        Correos de prueba
        {mails.length > 0 && (
          <span className="grid min-w-5 place-items-center rounded-full bg-brand-500 px-1.5 text-xs">{mails.length}</span>
        )}
      </button>
    </div>
  )
}
