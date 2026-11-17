interface ProfileAboutProps {
  bio?: string
  skills: string[]
}

export function ProfileAbout({ bio, skills }: ProfileAboutProps) {
  return (
    <div className="space-y-7">
      {/* Sección Sobre mí */}
      <div>
        <h2 className="text-lg font-bold text-ink">Sobre mí</h2>
        <div className="mt-3">
          {bio && bio.trim().length > 0 ? (
            <p className="text-[15px] leading-relaxed text-ink/80 whitespace-pre-line">{bio}</p>
          ) : (
            <p className="text-[15px] text-muted italic">Aún no has agregado una biografía.</p>
          )}
        </div>
      </div>

      {/* Sección Habilidades */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Habilidades</h2>
          {skills.length > 0 && (
            <span className="text-xs text-muted font-medium">{skills.length} agregadas</span>
          )}
        </div>
        <div className="mt-3">
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-ink-soft transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="inline-flex rounded-full border border-dashed border-subtle/50 px-4 py-1.5 text-sm text-subtle">
              Sin habilidades agregadas
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
