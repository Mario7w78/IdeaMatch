import { useId } from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

/** Interruptor accesible (role="switch") con etiqueta y descripción visibles. */
export function Toggle({ checked, onChange, label, description, disabled = false }: ToggleProps) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-[15px] font-semibold text-ink">
          {label}
        </p>
        {description && (
          <p id={`${id}-desc`} className="mt-0.5 text-sm text-muted">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-brand-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-brand-600' : 'bg-subtle/60'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  )
}
