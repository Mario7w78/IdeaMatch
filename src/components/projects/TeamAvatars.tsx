import { initialsOf } from '../../lib/format'

const TONES = [
  'bg-brand-100 text-brand-700',
  'bg-orange-100 text-orange-700',
  'bg-success-50 text-success-600',
  'bg-brand-200 text-brand-800',
]

/** Fila de avatares superpuestos con las iniciales de las primeras personas del equipo. */
export function TeamAvatars({ names, max = 3 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max)
  const extra = names.length - shown.length
  return (
    <div className="flex -space-x-2" aria-hidden="true">
      {shown.map((name, i) => (
        <span
          key={`${name}-${i}`}
          className={`grid size-8 place-items-center rounded-full border-2 border-white text-[10px] font-semibold ${TONES[i % TONES.length]}`}
        >
          {initialsOf(name)}
        </span>
      ))}
      {extra > 0 && (
        <span className="grid size-8 place-items-center rounded-full border-2 border-white bg-surface text-[10px] font-semibold text-muted">
          +{extra}
        </span>
      )}
    </div>
  )
}
