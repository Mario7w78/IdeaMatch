import { Edit3 } from 'lucide-react'
import { Button } from '../ui/Button'

interface ProfileHeaderProps {
  fullName: string
  initials: string
  occupation?: string
  location?: string
  avatarUrl?: string
  isCompleted: boolean
  isOwnProfile?: boolean
  onEditClick?: () => void
}

export function ProfileHeader({
  fullName,
  initials,
  occupation,
  location,
  avatarUrl,
  isCompleted,
  isOwnProfile = true,
  onEditClick,
}: ProfileHeaderProps) {
  const subtitle =
    occupation || location
      ? `${occupation ?? ''}${occupation && location ? ' · ' : ''}${location ?? ''}`
      : 'Perfil sin completar'

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
      {/* Banner */}
      <div
        className={`relative h-44 w-full sm:h-52 ${
          isCompleted
            ? 'bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400'
            : 'bg-line/60'
        }`}
      >
        {/* Decoración circular en el banner (Figma) */}
        <div
          className={`absolute top-1/2 right-8 -translate-y-1/2 size-36 sm:size-44 rounded-full pointer-events-none ${
            isCompleted ? 'bg-white/10 ring-1 ring-white/20' : 'bg-black/5'
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Contenido inferior al banner: avatar + info + botón */}
      <div className="px-6 pb-6 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Avatar squircle con borde blanco grueso */}
            <div className="relative -mt-14 size-24 shrink-0 overflow-hidden rounded-2xl bg-brand-100 ring-4 ring-white shadow-md sm:-mt-16 sm:size-28">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center font-bold text-2xl text-brand-700 sm:text-3xl">
                  {initials || (fullName ? fullName.slice(0, 2).toUpperCase() : 'U')}
                </div>
              )}
            </div>

            {/* Nombre y subtítulo */}
            <div className="pt-1 sm:pb-1">
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {fullName || 'Usuario'}
              </h1>
              <p className="mt-0.5 text-[15px] font-normal text-muted">{subtitle}</p>
            </div>
          </div>

          {/* Botón de acción */}
          {isOwnProfile && (
            <div className="sm:pb-1">
              <Button
                variant="primary"
                size="md"
                onClick={onEditClick}
                iconLeft={<Edit3 size={16} aria-hidden="true" />}
                className="w-full sm:w-auto"
              >
                {isCompleted ? 'Editar perfil' : 'Completar perfil'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
