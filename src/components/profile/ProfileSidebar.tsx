import { ArrowUpRight } from 'lucide-react'
import type { SocialLinks } from '../../services/profile/types'

interface ProfileSidebarProps {
  availabilityText?: string
  availabilityHours?: number
  links: SocialLinks
  badges: string[]
}

export function ProfileSidebar({
  availabilityText,
  availabilityHours,
  links,
  badges,
}: ProfileSidebarProps) {
  const displayAvailability =
    availabilityText || (availabilityHours ? `${availabilityHours} h / semana` : 'Sin definir')

  const hasAnyLink = Boolean(links.portfolio || links.linkedin || links.github)

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-xs space-y-6">
      {/* Disponibilidad */}
      <div>
        <h3 className="text-base font-bold text-ink">Disponibilidad</h3>
        <p className="mt-2 text-lg font-semibold text-success-600">{displayAvailability}</p>
      </div>

      <hr className="border-line" />

      {/* Enlaces */}
      <div>
        <h3 className="text-base font-bold text-ink">Enlaces</h3>
        <div className="mt-2.5">
          {hasAnyLink ? (
            <ul className="space-y-2.5">
              {links.portfolio && (
                <li>
                  <a
                    href={links.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    <span>Portfolio</span>
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </li>
              )}
              {links.linkedin && (
                <li>
                  <a
                    href={links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    <span>LinkedIn</span>
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </li>
              )}
              {links.github && (
                <li>
                  <a
                    href={links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    <span>GitHub</span>
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-subtle">No hay enlaces agregados.</p>
          )}
        </div>
      </div>

      <hr className="border-line" />

      {/* Insignias */}
      <div>
        <h3 className="text-base font-bold text-ink">Insignias</h3>
        <div className="mt-2.5">
          {badges && badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-subtle">Aún no tienes insignias.</p>
          )}
        </div>
      </div>
    </div>
  )
}
