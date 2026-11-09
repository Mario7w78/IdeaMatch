import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import type { ReactNode } from 'react'

const tones = {
  error: { box: 'border-danger-600/25 bg-danger-50 text-danger-600', Icon: CircleAlert },
  success: { box: 'border-success-600/25 bg-success-50 text-success-600', Icon: CircleCheck },
  info: { box: 'border-brand-200 bg-brand-50 text-brand-800', Icon: Info },
}

export function Alert({ tone = 'info', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  const { box, Icon } = tones[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${box}`}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
