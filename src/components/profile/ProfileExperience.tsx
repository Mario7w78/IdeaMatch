import { Folder, Zap } from 'lucide-react'
import type { VerifiedExperience } from '../../services/profile/types'

interface ProfileExperienceProps {
  experiences: VerifiedExperience[]
}

export function ProfileExperience({ experiences }: ProfileExperienceProps) {
  return (
    <div className="pt-2 border-t border-line">
      <h2 className="text-lg font-bold text-ink">Experiencia verificada</h2>
      <div className="mt-3.5 space-y-3">
        {experiences && experiences.length > 0 ? (
          experiences.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center gap-3.5 rounded-xl border border-line/60 bg-surface px-4 py-3.5 transition-colors"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-600">
                <Zap size={18} className="fill-brand-600/20" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-ink">
                  {exp.projectName} · {exp.role}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Contribución validada por el {exp.verifiedBy} · {exp.year}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-line/60 bg-surface px-4 py-3.5 text-muted">
            <Folder size={18} className="shrink-0 text-subtle" aria-hidden="true" />
            <span className="text-sm">No hay proyectos ni experiencia registrada.</span>
          </div>
        )}
      </div>
    </div>
  )
}
