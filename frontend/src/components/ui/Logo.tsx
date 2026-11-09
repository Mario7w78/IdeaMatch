import { Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'

interface LogoProps {
  to?: string
  size?: 'sm' | 'md'
  tone?: 'dark' | 'light'
}

export function LogoMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'size-8' : 'size-10'
  const icon = size === 'sm' ? 16 : 20
  return (
    <span
      className={`${box} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-[0_8px_24px_-6px_rgb(91_63_217/0.55)]`}
      aria-hidden="true"
    >
      <Rocket size={icon} strokeWidth={2.2} />
    </span>
  )
}

export function Logo({ to = '/', size = 'md', tone = 'dark' }: LogoProps) {
  const title = size === 'sm' ? 'text-base' : 'text-lg'
  const sub = size === 'sm' ? 'text-[10px]' : 'text-[11px]'
  return (
    <Link to={to} className="inline-flex items-center gap-3 rounded-lg" aria-label="IdeaMatch, ir al inicio">
      <LogoMark size={size} />
      <span className="flex flex-col leading-none">
        <span className={`${title} font-bold ${tone === 'dark' ? 'text-ink' : 'text-white'}`}>IdeaMatch</span>
        <span
          className={`${sub} mt-1 tracking-[0.12em] ${tone === 'dark' ? 'text-muted' : 'text-white/70'}`}
        >
          Ideas que despegan
        </span>
      </span>
    </Link>
  )
}
