import { LoaderCircle, UserX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EditProfileModal } from '../../components/profile/EditProfileModal'
import { ProfileAbout } from '../../components/profile/ProfileAbout'
import { ProfileExperience } from '../../components/profile/ProfileExperience'
import { ProfileHeader } from '../../components/profile/ProfileHeader'
import { ProfileSidebar } from '../../components/profile/ProfileSidebar'
import { Alert } from '../../components/ui/Alert'
import { ButtonLink } from '../../components/ui/Button'
import { useAuth } from '../../context/useAuth'
import {
  profileService,
  type Profile,
  type PublicProfile,
} from '../../services/profile'

export function ProfilePage() {
  const { id } = useParams<{ id?: string }>()
  const { session } = useAuth()
  const currentUser = session?.user

  // Determinar si estamos viendo nuestro propio perfil
  const isOwnProfile = !id || id === currentUser?.id

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function fetchProfile() {
      if (isOwnProfile && currentUser) {
        const p = await profileService.getProfile(currentUser.id)
        if (!active) return
        if (!p.firstName && currentUser.firstName) {
          p.firstName = currentUser.firstName
          p.lastName = currentUser.lastName
        }
        setProfile(p)
        setLoading(false)
      } else if (id) {
        const pub = await profileService.getPublicProfile(id)
        if (!active) return
        setPublicProfile(pub)
        setLoading(false)
      } else {
        if (!active) return
        setLoading(false)
      }
    }
    fetchProfile()
    return () => {
      active = false
    }
  }, [id, isOwnProfile, currentUser])

  useEffect(() => {
    if (!successMessage) return
    const t = setTimeout(() => setSuccessMessage(null), 4000)
    return () => clearTimeout(t)
  }, [successMessage])

  function handleProfileUpdated(updated: Profile) {
    setProfile(updated)
    setSuccessMessage('¡Perfil actualizado con éxito!')
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoaderCircle size={32} className="animate-spin text-brand-600" />
      </div>
    )
  }

  // Si estamos en vista pública y no existe el usuario (HU10 escenario alterno)
  if (!isOwnProfile && !publicProfile) {
    return (
      <div className="mx-auto max-w-lg text-center py-16">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-danger-50 text-danger-600">
          <UserX size={32} />
        </div>
        <h1 className="text-xl font-bold text-ink">Usuario no encontrado</h1>
        <p className="mt-2 text-sm text-muted">
          El perfil que estás buscando no existe o fue desactivado.
        </p>
        <div className="mt-6">
          <ButtonLink to="/app" variant="primary">
            Volver al inicio
          </ButtonLink>
        </div>
      </div>
    )
  }

  // Extraer datos comunes dependiendo de si es perfil propio o público
  const data = isOwnProfile ? profile : publicProfile
  if (!data) return null

  const fullName = isOwnProfile
    ? `${data.firstName} ${data.lastName}`.trim()
    : (publicProfile?.fullName || `${data.firstName} ${data.lastName}`.trim())

  const initials = `${data.firstName?.[0] ?? ''}${data.lastName?.[0] ?? ''}`.toUpperCase()

  // Se considera completado si tiene bio o al menos 1 habilidad (para estilizar banner)
  const isCompleted = Boolean(
    data.bio || (data.skills && data.skills.length > 0) || data.occupation,
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Alerta de confirmación */}
      {successMessage && <Alert tone="success">{successMessage}</Alert>}

      {/* Cabecera y Banner con Avatar superpuesto (HU06) */}
      <ProfileHeader
        fullName={fullName}
        initials={initials}
        occupation={data.occupation}
        location={data.location}
        avatarUrl={data.avatarUrl}
        isCompleted={isCompleted}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      {/* Cuadrícula de 2 columnas de Figma (Principal + Lateral) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Columna izquierda: Sobre mí, Habilidades y Experiencia verificada */}
        <div className="space-y-6 rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs">
          <ProfileAbout bio={data.bio} skills={data.skills || []} />
          <ProfileExperience experiences={data.verifiedExperiences || []} />
        </div>

        {/* Columna derecha: Disponibilidad, Enlaces e Insignias */}
        <aside>
          <ProfileSidebar
            availabilityText={data.availabilityText}
            availabilityHours={'availabilityHours' in data ? data.availabilityHours : undefined}
            links={data.links || {}}
            badges={data.badges || []}
          />
        </aside>
      </div>

      {/* Modal de edición de perfil (HU06, HU07, HU08, HU09) */}
      {isOwnProfile && profile && isEditModalOpen && (
        <EditProfileModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  )
}
