import type { ApplicationStats } from '../../services/applications'

interface ApplicationStatsCardsProps {
  stats: ApplicationStats
}

export function ApplicationStatsCards({ stats }: ApplicationStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {/* 1. Enviadas */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="text-3xl font-extrabold text-ink">{stats.total}</div>
        <div className="mt-1 text-sm font-medium text-muted">Enviadas</div>
      </div>

      {/* 2. En revisión */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="text-3xl font-extrabold text-ink">{stats.pending}</div>
        <div className="mt-1 text-sm font-medium text-muted">En revisión</div>
      </div>

      {/* 3. Aceptada (Destacada en morado como en Figma) */}
      <div className="rounded-2xl bg-brand-600 p-5 text-white shadow-sm transition-transform hover:-translate-y-0.5">
        <div className="text-3xl font-extrabold text-white">{stats.accepted}</div>
        <div className="mt-1 text-sm font-medium text-brand-100">Aceptada</div>
      </div>

      {/* 4. Finalizadas */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="text-3xl font-extrabold text-ink">{stats.finalized}</div>
        <div className="mt-1 text-sm font-medium text-muted">Finalizadas</div>
      </div>
    </div>
  )
}
