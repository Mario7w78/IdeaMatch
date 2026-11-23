import { LoaderCircle, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Toggle } from '../../components/ui/Toggle'
import { useAuth } from '../../context/useAuth'
import {
  EMAIL_EVENTS,
  emailPreferencesService,
  type EmailEvent,
  type EmailPreferences,
} from '../../services/emailPreferences'

type Draft = Pick<EmailPreferences, 'enabled' | 'events'>

const toDraft = (p: EmailPreferences): Draft => ({ enabled: p.enabled, events: { ...p.events } })
const sameDraft = (a: Draft, b: Draft) =>
  a.enabled === b.enabled && EMAIL_EVENTS.every(({ id }) => a.events[id] === b.events[id])

/** HU33: el usuario elige por qué eventos quiere recibir correos. */
export function EmailPreferencesPage() {
  const { session } = useAuth()
  const user = session?.user
  const [saved, setSaved] = useState<Draft | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!user) return
    let active = true
    emailPreferencesService.getPreferences(user.id).then((p) => {
      if (!active) return
      setSaved(toDraft(p))
      setDraft(toDraft(p))
    })
    return () => {
      active = false
    }
  }, [user])

  function change(next: Draft) {
    setDraft(next)
    setStatus('idle')
  }

  async function handleSave() {
    if (!user || !draft) return
    setSaving(true)
    try {
      const updated = await emailPreferencesService.updatePreferences(user.id, draft)
      setSaved(toDraft(updated))
      setDraft(toDraft(updated))
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const dirty = saved && draft ? !sameDraft(saved, draft) : false

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold tracking-[0.15em] text-brand-700 uppercase">Notificaciones</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Preferencias de correo</h1>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-muted">
        <Mail size={18} aria-hidden="true" />
        Los avisos se envían a <strong className="text-ink">{user?.email}</strong>
      </p>

      {!draft ? (
        <div role="status" className="mt-10 grid place-items-center py-16 text-muted">
          <LoaderCircle className="animate-spin" aria-label="Cargando preferencias" />
        </div>
      ) : (
        <section className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <Toggle
            label="Recibir notificaciones por correo"
            description="Si lo apagas, no te enviaremos ningún correo de IdeaMatch."
            checked={draft.enabled}
            onChange={(enabled) => change({ ...draft, enabled })}
          />
          <hr className="my-6 border-line" />
          <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">Avisarme cuando…</h2>
          <div className="mt-5 space-y-6">
            {EMAIL_EVENTS.map((ev) => (
              <Toggle
                key={ev.id}
                label={ev.label}
                description={ev.description}
                checked={draft.events[ev.id as EmailEvent]}
                disabled={!draft.enabled}
                onChange={(value) => change({ ...draft, events: { ...draft.events, [ev.id]: value } })}
              />
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {status === 'success' && <Alert tone="success">Preferencias guardadas.</Alert>}
            {status === 'error' && (
              <Alert tone="error">
                No pudimos guardar tus preferencias. Revisa tu conexión e inténtalo de nuevo.
              </Alert>
            )}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSave} loading={saving} disabled={!dirty}>
                Guardar cambios
              </Button>
              <Button
                variant="ghost"
                onClick={() => saved && change({ enabled: saved.enabled, events: { ...saved.events } })}
                disabled={!dirty || saving}
              >
                Descartar
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
