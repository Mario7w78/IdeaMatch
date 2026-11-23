import { ArrowRight, Users } from 'lucide-react'
import { ButtonLink } from '../ui/Button'

export function ApplicationsEmptyState() {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-white p-8 sm:p-14 text-center shadow-xs">
      <div className="relative mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
        <Users size={36} />
        {/* Indicador amarillo de actividad pendiente como en Figma */}
        <span className="absolute top-2 right-2 size-3 rounded-full bg-amber-400 ring-4 ring-white" />
      </div>

      <span className="inline-block text-xs font-bold tracking-wider uppercase text-brand-600 mb-2">
        Aún no hay actividad
      </span>

      <h2 className="text-2xl font-bold text-ink">
        Aún no has enviado postulaciones. ¡Explora proyectos aquí!
      </h2>

      <p className="mx-auto mt-2.5 max-w-md text-sm text-muted">
        No has enviado ninguna postulación. Explora los proyectos abiertos, encuentra un rol que coincida contigo y envía tu primera postulación.
      </p>

      <div className="mt-7">
        <ButtonLink
          to="/app/explorar"
          variant="primary"
          size="lg"
          iconRight={<ArrowRight size={18} />}
        >
          Explorar proyectos
        </ButtonLink>
      </div>
    </div>
  )
}
