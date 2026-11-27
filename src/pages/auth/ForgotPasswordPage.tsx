import { ArrowLeft, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../context/useAuth'
import { useForm } from '../../hooks/useForm'
import { AuthLayout } from '../../layouts/AuthLayout'
import { isValidEmail, MESSAGES } from '../../lib/validation'
import { LOGIN_PANEL, type VerifyCodeState } from './copy'

export function ForgotPasswordPage() {
  const { service } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const form = useForm({ email: '' }, (v) =>
    !v.email.trim() ? { email: MESSAGES.required } : !isValidEmail(v.email) ? { email: MESSAGES.email } : {},
  )

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setBusy(true)
    setError(null)
    try {
      // [HU04-FE] Respuesta genérica: la siguiente pantalla no revela si la cuenta existe.
      await service.requestPasswordReset(email)
      const state: VerifyCodeState = { email: email.trim().toLowerCase(), codeSent: true }
      navigate('/restablecer', { state })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos enviar el código. Intenta de nuevo.')
      setBusy(false)
    }
  })

  return (
    <AuthLayout {...LOGIN_PANEL}>
      <h1 className="text-4xl font-bold tracking-tight">Recupera tu contraseña</h1>
      <p className="mt-4 text-muted">
        Escribe el correo de tu cuenta y te enviaremos un código de 6 dígitos para crear una nueva contraseña. El código
        vence en 15 minutos.
      </p>

      <form noValidate onSubmit={onSubmit} className="mt-8 space-y-5">
        {error && <Alert tone="error">{error}</Alert>}
        <TextField
          label="Correo electrónico"
          icon={User}
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          {...form.field('email')}
        />
        <Button type="submit" size="lg" loading={busy} className="w-full">
          Enviar código
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
