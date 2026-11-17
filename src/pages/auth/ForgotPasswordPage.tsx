import { ArrowLeft, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../context/useAuth'
import { useForm } from '../../hooks/useForm'
import { AuthLayout } from '../../layouts/AuthLayout'
import { isValidEmail, MESSAGES } from '../../lib/validation'
import { GENERIC_RESET_MESSAGE, LOGIN_PANEL } from './copy'

export function ForgotPasswordPage() {
  const { service } = useAuth()
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const form = useForm({ email: '' }, (v) =>
    !v.email.trim() ? { email: MESSAGES.required } : !isValidEmail(v.email) ? { email: MESSAGES.email } : {},
  )

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setBusy(true)
    await service.requestPasswordReset(email)
    setBusy(false)
    setSent(true)
  })

  return (
    <AuthLayout {...LOGIN_PANEL}>
      <h1 className="text-4xl font-bold tracking-tight">Recupera tu contraseña</h1>
      <p className="mt-4 text-muted">
        Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña. El enlace vence en 1
        hora.
      </p>

      <form noValidate onSubmit={onSubmit} className="mt-8 space-y-5">
        {sent && <Alert tone="success">{GENERIC_RESET_MESSAGE}</Alert>}
        <TextField
          label="Correo electrónico"
          icon={User}
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          {...form.field('email')}
        />
        <Button type="submit" size="lg" loading={busy} className="w-full">
          {sent ? 'Reenviar enlace' : 'Enviar enlace'}
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Volver a iniciar sesión
      </Link>
    </AuthLayout>
  )
}
