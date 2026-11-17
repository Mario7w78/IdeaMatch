import { Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  icon?: LucideIcon
  error?: string
  hint?: ReactNode
  /** Contenido alineado a la derecha de la etiqueta (p. ej. "¿Olvidaste tu contraseña?"). */
  labelAction?: ReactNode
  /** Muestra el botón para ver u ocultar la contraseña. */
  revealable?: boolean
  revealStyle?: 'icon' | 'text'
}

export function TextField({
  label,
  icon: Icon,
  error,
  hint,
  labelAction,
  revealable = false,
  revealStyle = 'icon',
  type = 'text',
  className = '',
  ...rest
}: TextFieldProps) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const inputType = revealable ? (visible ? 'text' : 'password') : type
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <div className="mb-2 flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {labelAction}
      </div>
      <div
        className={`flex h-12 items-center gap-3 rounded-xl border bg-field px-4 transition-colors focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-100 ${
          error ? 'border-danger-600 bg-danger-50/40' : 'border-line'
        }`}
      >
        {Icon && <Icon size={18} className="shrink-0 text-muted" aria-hidden="true" />}
        <input
          id={id}
          type={inputType}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-full w-full min-w-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle"
          {...rest}
        />
        {revealable && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className={`shrink-0 rounded-md text-brand-700 hover:text-brand-800 ${
              revealStyle === 'text' ? 'text-sm font-semibold' : 'p-1'
            }`}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
          >
            {revealStyle === 'text' ? (
              visible ? 'Ocultar' : 'Ver'
            ) : visible ? (
              <EyeOff size={20} aria-hidden="true" />
            ) : (
              <Eye size={20} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {hint && !error && (
        <div id={hintId} className="mt-2">
          {hint}
        </div>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-danger-600">
          {error}
        </p>
      )}
    </div>
  )
}
