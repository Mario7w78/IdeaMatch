import { KeyRound } from 'lucide-react'
import { useEffect, useState, type ComponentProps } from 'react'
import { TextField } from '../../components/ui/TextField'
import { VERIFY_CODE_LENGTH } from '../../services/auth'
import { RESEND_COOLDOWN_S } from './copy'

type CodeFieldProps = Omit<ComponentProps<typeof TextField>, 'label'> & {
  /** Recibe solo los dígitos (también limpia espacios o guiones al pegar el código del correo). */
  onCode: (code: string) => void
}

/** [HU02-FE][HU04-FE] Campo para el código de 6 dígitos que envía el backend por correo. */
export function CodeField({ onCode, ...rest }: CodeFieldProps) {
  return (
    <TextField
      label="Código de verificación"
      icon={KeyRound}
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="000000"
      className="[&_input]:font-mono [&_input]:tracking-[0.4em]"
      {...rest}
      onChange={(e) => onCode(e.target.value.replace(/\D/g, '').slice(0, VERIFY_CODE_LENGTH))}
    />
  )
}

/**
 * Botón "Reenviar código" con la misma espera que el backend (60 s).
 * `onResend` devuelve true si el envío salió bien, para reiniciar la espera.
 */
export function ResendCodeButton({
  onResend,
  startWithCooldown = false,
}: {
  onResend: () => Promise<boolean>
  startWithCooldown?: boolean
}) {
  const [cooldown, setCooldown] = useState(startWithCooldown ? RESEND_COOLDOWN_S : 0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  async function resend() {
    setBusy(true)
    const ok = await onResend()
    setBusy(false)
    if (ok) setCooldown(RESEND_COOLDOWN_S)
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted">
      <span>¿No te llegó el código?</span>
      <button
        type="button"
        onClick={resend}
        disabled={busy || cooldown > 0}
        className="rounded-md font-semibold text-brand-700 hover:underline focus-visible:ring-4 focus-visible:ring-brand-100 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-subtle disabled:no-underline"
      >
        {cooldown > 0 ? `Reenviar código en ${cooldown} s` : busy ? 'Reenviando…' : 'Reenviar código'}
      </button>
    </div>
  )
}
