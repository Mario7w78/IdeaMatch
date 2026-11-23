import type { ReactNode } from 'react'

const tones = {
  neutral: 'bg-surface text-muted border-line',
  brand: 'bg-brand-100 text-brand-800 border-brand-200',
  success: 'bg-success-50 text-success-600 border-success-600/25',
  danger: 'bg-danger-50 text-danger-600 border-danger-600/25',
  warning: 'bg-orange-50 text-warning-500 border-warning-500/30',
}

export type BadgeTone = keyof typeof tones

/** Etiqueta de estado (p. ej. «Pendiente», «Validada»). */
export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
