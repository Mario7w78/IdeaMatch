import { ArrowRight, MailCheck, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../context/useAuth'
import { useForm } from '../../hooks/useForm'
import { AuthLayout } from '../../layouts/AuthLayout'
import { isValidEmail, MESSAGES } from '../../lib/validation'
import { isVerifyCode, VERIFY_CODE_LENGTH } from '../../services/auth'
import { CodeField, ResendCodeButton } from './CodeField'
import { CODE_MESSAGES, codeErrorMessage, LOGIN_PANEL, type VerifyCodeState } from './copy'

/**
 * [HU02-FE] Verificación del correo con el código de 6 dígitos que envía el
 * backend al registrarse. Al confirmarlo, la cuenta se activa y la sesión queda iniciada.
 */
export function VerifyCodePage() {
  const { service, verifyEmailCode } = useAuth()
  const navigate = useNavigate()
  const state = (useLocation().state as VerifyCodeState | null) ?? {}
  const knownEmail = state.email?.trim().toLowerCase() ?? ''

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  const form = useForm({ email: knownEmail, code: '' }, (v) => ({
    ...(!v.email.trim() ? { email: MESSAGES.required } : !isValidEmail(v.email) ? { email: MESSAGES.email } : {}),
    ...(!v.code.trim() ? { code: MESSAGES.required } : !isVerifyCode(v.code) ? { code: CODE_MESSAGES.length } : {}),
  }))

  const onSubmit = form.handleSubmit(async ({ email, code }) => {
    setBusy(true)
    setError(null)
    setResent(false)
    try {
      await verifyEmailCode(email, code)
      navigate('/app', { replace: true })
    } catch (e) {
      setError(codeErrorMessage(e))
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
      await service.resendVerification(email)
      setResent(true)
      form.setValues((v) => ({ ...v, code: '' }))
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos reenviar el código. Intenta de nuevo.')
      return false
    }
  }

  return (
    <AuthLayout {...LOGIN_PANEL}>
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <MailCheck size={28} aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">
        {state.registered ? '¡Tu cuenta fue creada!' : 'Verifica tu correo'}
      </h1>
      <p className="mt-4 text-muted">
        {knownEmail ? (
          <>
            Enviamos un código de {VERIFY_CODE_LENGTH} dígitos a <strong className="text-ink">{knownEmail}</strong>.
          </>
        ) : (
          <>Escribe tu correo y el código de {VERIFY_CODE_LENGTH} dígitos que te enviamos.</>
        )}{' '}
        Ingrésalo para activar tu cuenta; vence en 15 minutos.
      </p>

      <form noValidate onSubmit={onSubmit} className="mt-8 space-y-5">
        {error && <Alert tone="error">{error}</Alert>}
        {resent && <Alert tone="success">{CODE_MESSAGES.resent}</Alert>}

        {!knownEmail && (
          <TextField
            label="Correo electrónico"
            icon={User}
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            {...form.field('email')}
          />
        )}
        <CodeField {...form.field('code')} onCode={(code) => form.setValues((v) => ({ ...v, code }))} />
        <Button type="submit" size="lg" loading={busy} className="w-full" iconRight={<ArrowRight size={18} />}>
          Verificar y entrar
        </Button>
      </form>

      <ResendCodeButton onResend={resend} startWithCooldown={state.registered} />
      <p className="mt-3 text-center text-sm text-muted">
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
