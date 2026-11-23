import type { Application } from '../../services/applications'
import { ApplicationBadge } from './ApplicationBadge'

interface ApplicationsTableProps {
  applications: Application[]
  onViewDetail: (app: Application) => void
  onCancelApplication?: (app: Application) => void
}

// Colores decorativos de tarjeta de proyecto según categoría (inspirados en Figma)
function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'salud digital':
      return 'bg-purple-100 text-purple-700'
    case 'impacto social':
      return 'bg-emerald-100 text-emerald-700'
    case 'fintech':
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-brand-100 text-brand-700'
  }
}

export function ApplicationsTable({
  applications,
  onViewDetail,
  onCancelApplication,
}: ApplicationsTableProps) {
  return (
    <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
      {/* Cabecera de la tabla */}
      <div className="hidden sm:grid grid-cols-[1.4fr_1.1fr_110px_200px_120px] items-center border-b border-line bg-surface/60 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
        <div>Proyecto</div>
        <div>Rol</div>
        <div>Fecha</div>
        <div>Estado</div>
        <div className="text-right">Acción</div>
      </div>

      {/* Filas */}
      <div className="divide-y divide-line">
        {applications.map((app) => {
          const dateFormatted = new Date(app.createdAt).toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'short',
          })
          const isPending = app.status === 'PENDING'

          return (
            <div
              key={app.id}
              className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1.1fr_110px_200px_120px] sm:items-center px-6 py-4.5 transition-colors hover:bg-surface/30"
              data-testid={`app-row-${app.id}`}
            >
              {/* Columna 1: Proyecto con isotipo de color */}
              <div className="flex items-center gap-3">
                <div
                  className={`size-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${getCategoryColor(app.projectCategory)}`}
                >
                  {app.projectTitle.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-ink text-sm sm:text-base">{app.projectTitle}</div>
                  <div className="text-xs text-muted">{app.projectCategory}</div>
                </div>
              </div>

              {/* Columna 2: Rol */}
              <div>
                <span className="sm:hidden text-xs font-semibold text-muted uppercase mr-1">
                  Rol:
                </span>
                <span className="text-sm font-medium text-ink">{app.roleName}</span>
              </div>

              {/* Columna 3: Fecha */}
              <div className="text-xs sm:text-sm text-muted">
                <span className="sm:hidden text-xs font-semibold text-muted uppercase mr-1">
                  Fecha:
                </span>
                {dateFormatted}
              </div>

              {/* Columna 4: Estado (Badge) */}
              <div>
                <ApplicationBadge status={app.status} />
              </div>

              {/* Columna 5: Acciones */}
              <div className="flex items-center justify-start sm:justify-end gap-3 pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={() => onViewDetail(app)}
                  className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
                >
                  Ver detalle
                </button>
                {isPending && onCancelApplication && (
                  <button
                    type="button"
                    onClick={() => onCancelApplication(app)}
                    className="text-xs text-muted hover:text-danger-600 transition-colors cursor-pointer ml-1"
                    title="Cancelar postulación"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
