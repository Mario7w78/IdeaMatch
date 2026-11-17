import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/ui/Logo'

interface AuthLayoutProps {
  badge: string
  title: string
  subtitle: string
  extra?: ReactNode
  children: ReactNode
}

/** Pantallas de acceso: panel de marca a la izquierda y formulario a la derecha. */
export function AuthLayout({ badge, title, subtitle, extra, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-900 via-[#4a32a8] to-[#7651db] px-10 py-8 text-white lg:flex lg:flex-col">
        <Curves />
        <Link
          to="/"
          className="relative inline-flex w-fit items-center gap-2 rounded-lg text-white/90 hover:text-white"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Volver al inicio
        </Link>
        <div className="relative mt-14 max-w-lg xl:ml-8">
          <span className="inline-block rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs font-semibold">
            {badge}
          </span>
          <p className="mt-6 text-4xl leading-[1.04] font-bold tracking-tight xl:text-5xl">{title}</p>
          <p className="mt-8 max-w-md text-base leading-relaxed text-white/80">{subtitle}</p>
          {extra}
        </div>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-10 lg:px-16 lg:py-14 xl:px-20">
        <Link
          to="/"
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-lg text-sm text-muted hover:text-ink lg:hidden"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Volver al inicio
        </Link>
        <div className="w-full max-w-[440px]">
          <Logo />
          <div className="mt-10">{children}</div>
        </div>
      </main>
    </div>
  )
}

function Curves() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M1000 540 L640 700 Q480 780 480 900 Q480 1000 560 1060" fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1.5" />
      <path d="M1000 930 L760 1040" fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1.5" />
    </svg>
  )
}

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ol className="mt-12 space-y-3">
      {items.map((text, i) => (
        <li key={text} className="flex items-center gap-3 text-sm text-white/85">
          <span className="grid size-8 place-items-center rounded-lg border border-white/25 bg-white/10 text-xs font-bold">
            {String(i + 1).padStart(2, '0')}
          </span>
          {text}
        </li>
      ))}
    </ol>
  )
}
