import { passwordScore } from '../../lib/validation'

const COLORS = ['bg-line', 'bg-warning-500', 'bg-amber-400', 'bg-lime-500', 'bg-success-600']
const LABELS = ['', 'Débil', 'Regular', 'Buena', 'Fuerte']

export function PasswordStrength({ value }: { value: string }) {
  const score = passwordScore(value)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <div className="flex flex-1 gap-2" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1 min-w-8 flex-1 rounded-full transition-colors ${i <= score ? COLORS[score] : 'bg-line'}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted" aria-live="polite">
        {score > 0 && <span className="sr-only">Fortaleza: {LABELS[score]}. </span>}
        Usa 8 caracteres, una mayúscula y un número.
      </p>
    </div>
  )
}
