import { ArrowLeft, CircleCheck, Shield, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button, ButtonLink } from '../../components/ui/Button'
import { PasswordStrength } from '../../components/ui/PasswordStrength'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../context/useAuth'
import { useForm } from '../../hooks/useForm'
import { AuthLayout } from '../../layouts/AuthLayout'
import { isValidEmail, isValidPassword, MESSAGES } from '../../lib/validation'
import { isVerifyCode, VERIFY_CODE_LENGTH } from '../../services/auth'
import { CodeField, ResendCodeButton } from './CodeField'
import { CODE_MESSAGES, codeErrorMessage, LOGIN_PANEL, type VerifyCodeState } from './copy'

/**
 * [HU04-FE] Crear una nueva contraseña.
 * - `/restablecer` (backend): con el código de 6 dígitos que llega al correo.
 * - `/restablecer/:token` (servicio simulado): con el enlace del correo.
 */
export function ResetPasswordPage() {
  const { token } = useParams()
  const withCode = token === undefined
  const { service } = useAuth()
  const state = (useLocation().state as VerifyCodeState | null) ?? {}
  const knownEmail = state.email?.trim().toLowerCase() ?? ''

  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  const form = useForm({ email: knownEmail, code: '', password: '', confirm: '' }, (v) => ({
    ...(withCode
      ? {
          ...(!v.email.trim() ? { email: MESSAGES.required } : !isValidEmail(v.email) ? { email: MESSAGES.email } : {}),
          ...(!v.code.trim() ? { code: MESSAGES.required } : !isVerifyCode(v.code) ? { code: CODE_MESSAGES.length } : {}),
        }
      : {}),
    ...(!isValidPassword(v.password) ? { password: MESSAGES.password } : {}),
    ...(!v.confirm ? { confirm: MESSAGES.required } : v.confirm !== v.password ? { confirm: MESSAGES.passwordMismatch } : {}),
  }))

  const onSubmit = form.handleSubmit(async ({ email, code, password }) => {
    setBusy(true)
    setError(null)
    setResent(false)
    try {
      if (withCode) await service.resetPasswordWithCode(email, code, password)
      else await service.resetPassword(token, password)
      setDone(true)
    } catch (e) {
      setError(codeErrorMessage(e))
    } finally {
      setBusy(false)
    }
  })

  async function resend(): Promise<boolean> {
    const email = form.values.email.trim()
    setError(null)
    setResent(false)
    if (!isValidEmail(email)) {
      setError(MESSAGES.email)
      return false
    }
    try {
      await service.requestPasswordReset(email)
      setResent(true)
      form.setValues((v) => ({ ...v, code: '' }))
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos reenviar el código. Intenta de nuevo.')
      return false
    }
  }

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
      <p className="mt-4 text-muted">
        {withCode ? (
          <>
            {knownEmail ? (
              <>
                Si <strong className="text-ink">{knownEmail}</strong> tiene una cuenta, le enviamos un código de{' '}
                {VERIFY_CODE_LENGTH} dígitos.
              </>
            ) : (
              <>Escribe tu correo y el código de {VERIFY_CODE_LENGTH} dígitos que te enviamos.</>
            )}{' '}
            Vence en 15 minutos.
          </>
        ) : (
          'Elige una contraseña que no hayas usado antes.'
        )}
      </p>

      <form noValidate onSubmit={onSubmit} className="mt-8 space-y-5">
        {error && (
          <Alert tone="error">
            {error}{' '}
            {!withCode && (
              <Link to="/recuperar" className="font-semibold underline underline-offset-2">
                Solicitar un nuevo código
              </Link>
            )}
          </Alert>
        )}
        {resent && <Alert tone="success">{CODE_MESSAGES.resent}</Alert>}

        {withCode && !knownEmail && (
          <TextField
            label="Correo electrónico"
            icon={User}
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            {...form.field('email')}
          />
        )}
        {withCode && (
          <CodeField {...form.field('code')} onCode={(code) => form.setValues((v) => ({ ...v, code }))} />
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

      {withCode && <ResendCodeButton onResend={resend} startWithCooldown={state.codeSent} />}
      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Volver a iniciar sesión
      </Link>
    </AuthLayout>
  )
}
