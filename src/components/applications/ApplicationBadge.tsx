import type { ApplicationStatus } from '../../services/applications'

interface ApplicationBadgeProps {
  status: ApplicationStatus
}

export function ApplicationBadge({ status }: ApplicationBadgeProps) {
  switch (status) {
    case 'PENDING':
      return (
        <span
          className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"
          data-testid="badge-pending"
        >
          En revisión
        </span>
      )
    case 'ACCEPTED':
      return (
        <span
          className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
          data-testid="badge-accepted"
        >
          Aceptada
        </span>
      )
    case 'REJECTED':
      return (
        <span
          className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
          data-testid="badge-rejected"
        >
          No seleccionada
        </span>
      )
    case 'CANCELLED':
      return (
        <span
          className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
          data-testid="badge-cancelled"
        >
          Cancelada por Colaborador
        </span>
      )
  }
}
