import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '../../components/ui/Button'
import { RocketArt } from '../../components/RocketArt'
import { useAuth } from '../../context/useAuth'

export function HomePage() {
  const { session } = useAuth()
  return (
    <section className="grid overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-brand-50 via-white to-brand-100/60 lg:grid-cols-[1.05fr_1fr]">
      <div className="px-6 py-10 sm:px-10 lg:py-16">
        <span className="inline-block rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
          Comunidad de talento e ideas
        </span>
        <p className="mt-4 text-sm text-muted">Hola, {session?.user.firstName} 👋</p>
        <h1 className="mt-2 text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl">
          Tu próxima gran idea merece <span className="text-brand-600">despegar.</span>
        </h1>
        <p className="mt-5 max-w-md text-muted">
          Conecta con talento, forma el equipo ideal y transforma una idea en un proyecto real.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/app/explorar" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
            Explorar proyectos
          </ButtonLink>
          <ButtonLink to="/app/publicar" variant="secondary">
            Publicar mi idea
          </ButtonLink>
        </div>
        <div className="mt-8 flex items-center gap-3 text-sm text-muted">
          <div className="flex -space-x-2" aria-hidden="true">
            {['AC', 'JM', 'NS', 'RL'].map((x, i) => (
              <span
                key={x}
                className={`grid size-8 place-items-center rounded-full border-2 border-white text-[10px] font-semibold ${
                  ['bg-brand-100 text-brand-700', 'bg-orange-100 text-orange-700', 'bg-success-50 text-success-600', 'bg-brand-200 text-brand-800'][i]
                }`}
              >
                {x}
              </span>
            ))}
          </div>
          <span>
            <strong className="text-ink">+2,400</strong> personas creando juntas
          </span>
        </div>
      </div>
      <div className="hidden items-center justify-center bg-white p-6 lg:flex">
        <RocketArt className="w-full max-w-[440px]" />
      </div>
    </section>
  )
}
