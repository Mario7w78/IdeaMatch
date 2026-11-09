import { CircleCheck, Shield } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button, ButtonLink } from '../../components/ui/Button'
import { PasswordStrength } from '../../components/ui/PasswordStrength'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../context/useAuth'
import { useForm } from '../../hooks/useForm'
import { AuthLayout } from '../../layouts/AuthLayout'
import { isValidPassword, MESSAGES } from '../../lib/validation'
import { AuthError } from '../../services/auth'
import { LOGIN_PANEL } from './copy'

export function ResetPasswordPage() {
  const { token = '' } = useParams()
  const { service } = useAuth()
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [invalid, setInvalid] = useState<string | null>(null)

  const form = useForm({ password: '', confirm: '' }, (v) => ({
    ...(!isValidPassword(v.password) ? { password: MESSAGES.password } : {}),
    ...(!v.confirm ? { confirm: MESSAGES.required } : v.confirm !== v.password ? { confirm: MESSAGES.passwordMismatch } : {}),
  }))

  const onSubmit = form.handleSubmit(async ({ password }) => {
    setBusy(true)
    try {
      await service.resetPassword(token, password)
      setDone(true)
    } catch (e) {
      setInvalid(e instanceof AuthError ? e.message : 'No pudimos cambiar tu contraseña. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  })

  if (done) {
    return (
      <AuthLayout {...LOGIN_PANEL}>
        <span className="grid size-14 place-items-center rounded-2xl bg-success-50 text-success-600">
          <CircleCheck size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">Contraseña actualizada</h1>
        <p className="mt-4 text-muted">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <ButtonLink to="/login" size="lg" className="mt-8">
          Iniciar sesión
        </ButtonLink>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout {...LOGIN_PANEL}>
      <h1 className="text-4xl font-bold tracking-tight">Crea una nueva contraseña</h1>
      <p className="mt-4 text-muted">Elige una contraseña que no hayas usado antes.</p>

      <form noValidate onSubmit={onSubmit} className="mt-8 space-y-5">
        {invalid && (
          <Alert tone="error">
            {invalid}.{' '}
            <Link to="/recuperar" className="font-semibold underline underline-offset-2">
              Solicitar un nuevo enlace
            </Link>
          </Alert>
        )}
        <TextField
          label="Nueva contraseña"
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
        <Button type="submit" size="lg" loading={busy} className="w-full">
          Guardar contraseña
        </Button>
      </form>
    </AuthLayout>
  )
}
