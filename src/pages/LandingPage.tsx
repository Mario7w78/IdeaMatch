import { ArrowRight, Search, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '../components/ui/Button'
import { buttonClasses } from '../components/ui/buttonClasses'
import { Logo, LogoMark } from '../components/ui/Logo'
import { RocketArt } from '../components/RocketArt'
import { useAuth } from '../context/useAuth'

const YEAR = new Date().getFullYear()

const STEPS = [
  {
    n: '01',
    icon: Zap,
    tone: 'bg-brand-100 text-brand-700',
    title: 'Comparte tu idea',
    text: 'Cuenta qué quieres construir, qué impacto buscas y cuáles son los roles que necesita tu equipo.',
  },
  {
    n: '02',
    icon: Search,
    tone: 'bg-success-50 text-success-600',
    title: 'Encuentra a tu equipo',
    text: 'Conecta con personas que aportan las habilidades, la experiencia y el propósito que te faltan.',
  },
  {
    n: '03',
    icon: Users,
    tone: 'bg-orange-50 text-warning-500',
    title: 'Construyan juntos',
    text: 'Coordina el proyecto, comparte avances y convierte el potencial del equipo en resultados reales.',
  },
]

const PROJECTS = [
  {
    category: 'Desarrollo web',
    name: 'Lúmina',
    text: 'Una plataforma de aprendizaje accesible creada por un equipo de cinco talentos.',
    cover: 'from-brand-900 to-brand-500',
  },
  {
    category: 'App móvil',
    name: 'Cosecha',
    text: 'Tecnología que conecta productores locales directamente con nuevos mercados.',
    cover: 'from-[#1d6b5c] to-[#5fcf9f]',
  },
  {
    category: 'Datos e Inteligencia Artificial',
    name: 'Pulso',
    text: 'Acompañamiento preventivo que transforma datos cotidianos en hábitos saludables.',
    cover: 'from-[#a3405a] to-[#f39a5a]',
  },
]

export function LandingPage() {
  const { session } = useAuth()

  return (
    <div className="bg-white">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
          <Logo size="sm" />
          <nav aria-label="Secciones" className="hidden gap-7 text-sm text-muted md:flex">
            <a href="#como-funciona" className="hover:text-ink">Cómo funciona</a>
            <a href="#proyectos" className="hover:text-ink">Proyectos reales</a>
            <a href="#comunidad" className="hover:text-ink">Comunidad</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            {session ? (
              <ButtonLink to="/app" size="sm">Ir a mi panel</ButtonLink>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-2 py-1 text-sm font-semibold text-brand-700 hover:underline">
                  Iniciar sesión
                </Link>
                <ButtonLink to="/registro" size="sm">Crear una cuenta</ButtonLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="grid lg:grid-cols-2">
          <div className="bg-gradient-to-br from-white via-brand-50 to-brand-100/70 px-4 py-16 sm:px-6 lg:py-24 lg:pr-12 lg:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
            <span className="inline-block rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
              La comunidad donde las ideas encuentran equipo
            </span>
            <h1 className="mt-6 text-5xl leading-[1.02] font-bold tracking-tight sm:text-6xl">
              Una buena idea puede cambiarlo todo. <span className="text-brand-600">No la construyas solo.</span>
            </h1>
            <p className="mt-6 max-w-xl text-muted">
              IdeaMatch conecta personas con ideas, habilidades y propósito. Publica un proyecto, encuentra el talento
              indicado y construyan algo real juntos.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonLink to="/registro" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
                Quiero empezar
              </ButtonLink>
              <a href="#proyectos" className="text-sm font-semibold text-ink hover:underline">
                Conocer proyectos reales
              </a>
            </div>
            <dl className="mt-12 flex gap-8 divide-x divide-line">
              {[
                ['2,400+', 'miembros'],
                ['184', 'proyectos activos'],
                ['62', 'ideas lanzadas'],
              ].map(([n, label]) => (
                <div key={label} className="pr-8 first:pl-0 [&:not(:first-child)]:pl-8">
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-2xl font-bold">{n}</dd>
                  <dd className="max-w-20 text-xs text-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex items-center justify-center overflow-hidden bg-white p-6">
            <RocketArt className="w-full max-w-[520px]" />
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.15em] text-brand-700 uppercase">De la idea a la realidad</p>
            <h2 className="mx-auto mt-3 max-w-md text-4xl font-bold tracking-tight">Todo empieza con una conexión</h2>
            <p className="mt-4 text-muted">No necesitas tener todas las respuestas. Solo una idea y las ganas de construirla.</p>
          </div>
          <ol className="mt-14 grid gap-5 md:grid-cols-3">
            {STEPS.map(({ n, icon: Icon, tone, title, text }) => (
              <li key={n} className="relative rounded-2xl border border-line bg-white p-6 shadow-card">
                <span className="absolute top-5 right-6 text-3xl font-bold text-line">{n}</span>
                <span className={`grid size-10 place-items-center rounded-xl ${tone}`}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Proyectos */}
        <section id="proyectos" className="scroll-mt-20 bg-surface py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-xs font-semibold tracking-[0.15em] text-brand-700 uppercase">Nacieron en IdeaMatch</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">Ideas que ya despegaron</h2>
            <p className="mt-4 max-w-lg text-muted">
              Estos proyectos encontraron su equipo en la plataforma y hoy generan impacto fuera de ella.
            </p>
            <ul className="mt-12 grid gap-5 md:grid-cols-3">
              {PROJECTS.map((p) => (
                <li key={p.name} className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                  <div className={`relative grid h-44 place-items-center bg-gradient-to-br ${p.cover}`}>
                    <span className="absolute h-24 w-52 -rotate-12 rounded-full border border-white/40" aria-hidden="true" />
                    <span className="grid size-12 place-items-center rounded-full bg-white/20 text-white">
                      <Zap size={22} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-semibold tracking-wider text-brand-700">{p.category}</p>
                    <h3 className="mt-2 text-xl font-semibold">{p.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="flex -space-x-2" aria-hidden="true">
                        {['MC', 'AR', 'LP', '+2'].map((x, i) => (
                          <span
                            key={x}
                            className={`grid size-7 place-items-center rounded-full border-2 border-white text-[10px] font-semibold ${
                              ['bg-brand-100 text-brand-700', 'bg-orange-100 text-orange-700', 'bg-success-50 text-success-600', 'bg-brand-200 text-brand-800'][i]
                            }`}
                          >
                            {x}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-muted">Equipo formado en IdeaMatch</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section id="comunidad" className="scroll-mt-20 bg-ink-soft py-24 text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2">
            <div className="relative mx-auto grid h-48 w-72 place-items-center">
              <span className="absolute inset-0 -rotate-12 rounded-full border border-white/20" aria-hidden="true" />
              <span className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 shadow-[0_12px_40px_-8px_rgb(122_92_236/0.8)]">
                <LogoMark />
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-brand-300 uppercase">Una comunidad, muchas posibilidades</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight">Tu habilidad puede ser la pieza que una gran idea necesita.</h2>
              <p className="mt-4 text-white/70">
                No importa si vienes a liderar un proyecto o a aportar tu talento. En IdeaMatch cada conexión tiene el
                potencial de convertirse en algo extraordinario.
              </p>
              <Link to="/registro" className={buttonClasses('primary', 'sm', 'mt-8')}>
                Unirse <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1b1a26] text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-xs sm:px-6 md:flex-row md:items-center md:justify-between">
          <Logo size="sm" tone="light" />
          <p>Donde el talento y las ideas se encuentran.</p>
          <p>© {YEAR} IdeaMatch · Comunidad · Privacidad · Términos</p>
        </div>
      </footer>
    </div>
  )
}
