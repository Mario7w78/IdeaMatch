import { ArrowRight, MailCheck, Shield, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button, ButtonLink } from '../../components/ui/Button'
import { PasswordStrength } from '../../components/ui/PasswordStrength'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../context/useAuth'
import { useForm } from '../../hooks/useForm'
import { AuthLayout, FeatureList } from '../../layouts/AuthLayout'
import { isValidEmail, isValidPassword, MESSAGES } from '../../lib/validation'
import { AuthError } from '../../services/auth'

const PANEL = {
  badge: 'ÚNETE A LA COMUNIDAD',
  title: 'Tu talento puede impulsar la próxima gran idea.',
  subtitle:
    'Crea tu cuenta, descubre proyectos con propósito y empieza a construir junto a personas que complementan tus habilidades.',
  extra: (
    <FeatureList
      items={[
        'Un solo perfil para crear y colaborar',
        'Proyectos y oportunidades a tu medida',
        'Experiencia e insignias verificadas',
      ]}
    />
  ),
}

export function RegisterPage() {
  const { service } = useAuth()
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)

  const form = useForm(
    { firstName: '', lastName: '', email: '', password: '', confirm: '', terms: false as boolean },
    (v) => ({
      ...(!v.firstName.trim() ? { firstName: MESSAGES.required } : {}),
      ...(!v.lastName.trim() ? { lastName: MESSAGES.required } : {}),
      ...(!v.email.trim() ? { email: MESSAGES.required } : !isValidEmail(v.email) ? { email: MESSAGES.email } : {}),
      ...(!isValidPassword(v.password) ? { password: MESSAGES.password } : {}),
      ...(!v.confirm ? { confirm: MESSAGES.required } : v.confirm !== v.password ? { confirm: MESSAGES.passwordMismatch } : {}),
      ...(!v.terms ? { terms: MESSAGES.terms } : {}),
    }),
  )

  const emailField = form.field('email')

  const onSubmit = form.handleSubmit(async (v) => {
    setBusy(true)
    setServerError(null)
    setEmailError(null)
    try {
      await service.register({ firstName: v.firstName, lastName: v.lastName, email: v.email, password: v.password })
      setRegisteredEmail(v.email.trim().toLowerCase())
    } catch (e) {
      if (e instanceof AuthError && e.code === 'EMAIL_TAKEN_OR_INVALID') setEmailError(e.message)
      else setServerError(e instanceof Error ? e.message : 'No pudimos crear tu cuenta. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  })

  if (registeredEmail) {
    return (
      <AuthLayout {...PANEL}>
        <RegisterSuccess email={registeredEmail} onResend={() => service.resendVerification(registeredEmail)} />
      </AuthLayout>
    )
  }

  const terms = form.checkbox('terms')

  return (
    <AuthLayout {...PANEL}>
      <h1 className="text-4xl font-bold tracking-tight">Crea tu cuenta</h1>
      <p className="mt-3 text-muted">Usarás la misma cuenta para publicar ideas o colaborar en otros proyectos.</p>

      <form noValidate onSubmit={onSubmit} className="mt-8 space-y-5">
        {serverError && <Alert tone="error">{serverError}</Alert>}
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Nombre" autoComplete="given-name" placeholder="Tu nombre" {...form.field('firstName')} />
          <TextField label="Apellido" autoComplete="family-name" placeholder="Tu apellido" {...form.field('lastName')} />
        </div>
        <TextField
          label="Correo electrónico"
          icon={User}
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          {...emailField}
          onChange={(e) => {
            setEmailError(null)
            emailField.onChange(e)
          }}
          error={emailError ?? emailField.error}
        />
        <TextField
          label="Contraseña"
          icon={Shield}
          revealable
          revealStyle="text"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          hint={<PasswordStrength value={form.values.password} />}
          {...form.field('password')}
        />
        <TextField
          label="Confirmar contraseña"
          icon={Shield}
          type="password"
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          {...form.field('confirm')}
        />

        <div>
          <label className="flex items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              name={terms.name}
              checked={terms.checked}
              onChange={terms.onChange}
              aria-invalid={terms.error ? true : undefined}
              className="mt-0.5 size-4 shrink-0 accent-brand-600"
            />
            <span>
              Acepto los{' '}
              <a href="#" className="font-semibold text-brand-700 hover:underline">
                Términos de uso
              </a>{' '}
              y la{' '}
              <a href="#" className="font-semibold text-brand-700 hover:underline">
                Política de privacidad
              </a>
              .
            </span>
          </label>
          {terms.error && (
            <p role="alert" className="mt-2 text-sm text-danger-600">
              {terms.error}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" loading={busy} className="w-full" iconRight={<ArrowRight size={18} />}>
          Crear mi cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="ml-2 font-semibold text-brand-700 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  )
}

function RegisterSuccess({ email, onResend }: { email: string; onResend: () => Promise<void> }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  return (
    <div>
      <span className="grid size-14 place-items-center rounded-2xl bg-success-50 text-success-600">
        <MailCheck size={28} aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">¡Tu cuenta fue creada!</h1>
      <p className="mt-4 text-muted">
        Enviamos un enlace de activación a <strong className="text-ink">{email}</strong>. Ábrelo en las próximas 24
        horas para verificar tu correo y poder iniciar sesión.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink to="/login" size="lg">
          Ir a iniciar sesión
        </ButtonLink>
        <Button
          variant="secondary"
          size="lg"
          loading={state === 'sending'}
          disabled={state === 'sent'}
          onClick={async () => {
            setState('sending')
            await onResend()
            setState('sent')
          }}
        >
          {state === 'sent' ? 'Enlace reenviado' : 'Reenviar e-mail de activación'}
        </Button>
      </div>
    </div>
  )
}
