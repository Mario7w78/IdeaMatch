import { ArrowLeft } from 'lucide-react'
import { ButtonLink } from '../../components/ui/Button'
import type { NavItem } from '../../layouts/navigation'

/** Secciones aún no implementadas: indican en qué sprint llegan. */
export function ComingSoonPage({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.15em] text-brand-700 uppercase">Sprint {item.sprint}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{item.label}</h1>
      <section className="mt-8 flex flex-col items-center rounded-3xl border border-line bg-white px-6 py-16 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <Icon size={28} aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-brand-700 uppercase">En construcción</p>
        <h2 className="mt-2 text-2xl font-bold">Esta sección llega en el Sprint {item.sprint}</h2>
        <p className="mt-3 max-w-md text-muted">{item.description}</p>
        <ButtonLink to="/app" variant="secondary" className="mt-8" iconLeft={<ArrowLeft size={16} aria-hidden="true" />}>
          Volver al inicio
        </ButtonLink>
      </section>
    </div>
  )
}
