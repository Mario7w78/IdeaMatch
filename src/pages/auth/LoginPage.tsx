import { ArrowRight, Shield, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../context/useAuth'
import { useForm } from '../../hooks/useForm'
import { AuthLayout } from '../../layouts/AuthLayout'
import { isValidEmail, MESSAGES } from '../../lib/validation'
import { AuthError } from '../../services/auth'
import { LOGIN_PANEL } from './copy'

export function LoginPage() {
  const { login, service } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/app'
  const [error, setError] = useState<AuthError | null>(null)
  const [busy, setBusy] = useState(false)
  const [resent, setResent] = useState(false)

  const form = useForm({ email: '', password: '' }, (v) => ({
    ...(!v.email.trim() ? { email: MESSAGES.required } : !isValidEmail(v.email) ? { email: MESSAGES.email } : {}),
    ...(!v.password ? { password: MESSAGES.required } : {}),
  }))

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setBusy(true)
    setError(null)
    setResent(false)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (e) {
      setError(e instanceof AuthError ? e : new AuthError('INVALID_CREDENTIALS', 'No pudimos iniciar sesión. Intenta de nuevo.'))
      setBusy(false)
    }
  })

  async function resend() {
    await service.resendVerification(form.values.email)
    setResent(true)
  }

  return (
    <AuthLayout {...LOGIN_PANEL}>
      <h1 className="text-4xl font-bold tracking-tight">Inicia sesión</h1>
      <p className="mt-4 text-muted">Ingresa tus datos para continuar construyendo grandes ideas.</p>

      <form noValidate onSubmit={onSubmit} className="mt-8 space-y-5">
        {error && (
          <Alert tone="error">
            {error.message}
            {error.code === 'EMAIL_NOT_VERIFIED' && !resent && (
              <>
                {' '}
                <button type="button" onClick={resend} className="font-semibold underline underline-offset-2">
                  Reenviar e-mail de activación
                </button>
              </>
            )}
          </Alert>
        )}
        {resent && <Alert tone="success">Te enviamos un nuevo enlace de activación.</Alert>}

        <TextField
          label="Correo electrónico"
          icon={User}
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          {...form.field('email')}
        />
        <TextField
          label="Contraseña"
          icon={Shield}
          revealable
          autoComplete="current-password"
          placeholder="Ingresa tu contraseña"
          labelAction={
            <Link to="/recuperar" className="text-sm font-semibold text-brand-700 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          }
          {...form.field('password')}
        />
        <Button type="submit" size="lg" loading={busy} className="mt-4 w-full" iconRight={<ArrowRight size={18} />}>
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Aún no tienes una cuenta?{' '}
        <Link to="/registro" className="ml-2 font-semibold text-brand-700 hover:underline">
          Crear una cuenta
        </Link>
      </p>
    </AuthLayout>
  )
}
