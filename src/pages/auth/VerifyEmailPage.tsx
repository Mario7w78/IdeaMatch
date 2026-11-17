import { CircleCheck, LinkIcon, LoaderCircle, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button, ButtonLink } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../context/useAuth'
import { useForm } from '../../hooks/useForm'
import { AuthLayout } from '../../layouts/AuthLayout'
import { isValidEmail, MESSAGES } from '../../lib/validation'
import { LOGIN_PANEL } from './copy'

type Status = 'checking' | 'verified' | 'invalid'

export function VerifyEmailPage() {
  const { token = '' } = useParams()
  const { service } = useAuth()
  const [status, setStatus] = useState<Status>('checking')
  const started = useRef(false)

  useEffect(() => {
    // El token es de un solo uso: evitar la doble llamada de StrictMode.
    if (started.current) return
    started.current = true
    service
      .verifyEmail(token)
      .then(() => setStatus('verified'))
      .catch(() => setStatus('invalid'))
  }, [service, token])

  return (
    <AuthLayout {...LOGIN_PANEL}>
      {status === 'checking' && (
        <div role="status" className="flex items-center gap-3 text-muted">
          <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> Verificando tu enlace…
        </div>
      )}
      {status === 'verified' && (
        <div>
          <span className="grid size-14 place-items-center rounded-2xl bg-success-50 text-success-600">
            <CircleCheck size={28} aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">Cuenta verificada</h1>
          <p className="mt-4 text-muted">Tu correo quedó confirmado. Ya puedes iniciar sesión y empezar a colaborar.</p>
          <ButtonLink to="/login" size="lg" className="mt-8">
            Iniciar sesión
          </ButtonLink>
        </div>
      )}
      {status === 'invalid' && <InvalidLink />}
    </AuthLayout>
  )
}

function InvalidLink() {
  const { service } = useAuth()
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const form = useForm({ email: '' }, (v) =>
    !v.email.trim() ? { email: MESSAGES.required } : !isValidEmail(v.email) ? { email: MESSAGES.email } : {},
  )

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setBusy(true)
    await service.resendVerification(email)
    setBusy(false)
    setSent(true)
  })

  return (
    <div>
      <span className="grid size-14 place-items-center rounded-2xl bg-danger-50 text-danger-600">
        <LinkIcon size={26} aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">Enlace de activación inválido o expirado</h1>
      <p className="mt-4 text-muted">
        Los enlaces de activación vencen a las 24 horas y solo se pueden usar una vez. Escribe tu correo y te enviaremos
        uno nuevo.
      </p>
      {sent ? (
        <div className="mt-8">
          <Alert tone="success">Si tu cuenta está pendiente de verificación, recibirás un nuevo enlace.</Alert>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="mt-8 space-y-5">
          <TextField
            label="Correo electrónico"
            icon={User}
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            {...form.field('email')}
          />
          <Button type="submit" size="lg" loading={busy} className="w-full">
            Reenviar e-mail de activación
          </Button>
        </form>
      )}
    </div>
  )
}
