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
import { LOGIN_PANEL, type VerifyCodeState } from './copy'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/app'
  const [error, setError] = useState<AuthError | null>(null)
  const [busy, setBusy] = useState(false)

  const isEmailOrTestUser = (val: string) => {
    const v = val.trim().toLowerCase()
    return isValidEmail(v) || v === 'user1' || v === 'user2'
  }

  const form = useForm({ email: '', password: '' }, (v) => ({
    ...(!v.email.trim()
      ? { email: MESSAGES.required }
      : !isEmailOrTestUser(v.email)
        ? { email: MESSAGES.email }
        : {}),
    ...(!v.password ? { password: MESSAGES.required } : {}),
  }))

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setBusy(true)
    setError(null)
    const emailToUse =
      email.trim().toLowerCase() === 'user1'
        ? 'user1@ideamatch.com'
        : email.trim().toLowerCase() === 'user2'
          ? 'user2@ideamatch.com'
          : email
    try {
      await login(emailToUse, password)
      navigate(from, { replace: true })
    } catch (e) {
      setError(e instanceof AuthError ? e : new AuthError('INVALID_CREDENTIALS', 'No pudimos iniciar sesión. Intenta de nuevo.'))
      setBusy(false)
    }
  })

  return (
    <AuthLayout {...LOGIN_PANEL}>
      <h1 className="text-4xl font-bold tracking-tight">Inicia sesión</h1>
      <p className="mt-4 text-muted">Ingresa tus datos para continuar construyendo grandes ideas.</p>

      <form noValidate onSubmit={onSubmit} className="mt-8 space-y-5">
        {error && (
          <Alert tone="error">
            {error.message}
            {/* [HU02-FE] Cuenta pendiente: lleva a ingresar el código (ahí también se puede reenviar). */}
            {error.code === 'EMAIL_NOT_VERIFIED' && (
              <>
                {' '}
                <Link
                  to="/verificar-correo"
                  state={{ email: form.values.email.trim() } satisfies VerifyCodeState}
                  className="font-semibold underline underline-offset-2"
                >
                  Ingresar código de verificación
                </Link>
              </>
            )}
          </Alert>
        )}

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
