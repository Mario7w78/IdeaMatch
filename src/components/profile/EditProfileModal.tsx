import { Plus, Trash2, Upload, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  INITIAL_SKILLS_CATALOG,
  profileService,
  type Profile,
  type UpdateProfileInput,
} from '../../services/profile'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { TextField } from '../ui/TextField'

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
  profile: Profile
  onProfileUpdated: (updated: Profile) => void
}

const AVAILABILITY_PRESETS = [
  '5–10 h / semana',
  '10–15 h / semana',
  '15–20 h / semana',
  '20–30 h / semana',
  '30+ h / semana',
]

export function EditProfileModal({
  open,
  onClose,
  profile,
  onProfileUpdated,
}: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [firstName, setFirstName] = useState(profile.firstName || '')
  const [lastName, setLastName] = useState(profile.lastName || '')
  const [occupation, setOccupation] = useState(profile.occupation || '')
  const [location, setLocation] = useState(profile.location || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '')

  // Habilidades (HU07)
  const [skills, setSkills] = useState<string[]>(profile.skills || [])
  const [skillInput, setSkillInput] = useState('')

  // Disponibilidad (HU09)
  const [availabilityPreset, setAvailabilityPreset] = useState(
    AVAILABILITY_PRESETS.includes(profile.availabilityText || '')
      ? profile.availabilityText || ''
      : profile.availabilityText
        ? 'custom'
        : '',
  )
  const [customHours, setCustomHours] = useState(profile.availabilityHours?.toString() || '')

  // Enlaces (HU08)
  const [portfolio, setPortfolio] = useState(profile.links.portfolio || '')
  const [linkedin, setLinkedin] = useState(profile.links.linkedin || '')
  const [github, setGithub] = useState(profile.links.github || '')

  // Feedback states
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Manejador de carga de foto (HU06)
  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploadingAvatar(true)

    try {
      const url = await profileService.uploadAvatar(profile.userId, file)
      setAvatarUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la foto')
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleRemoveAvatar() {
    setAvatarUrl('')
  }

  // Manejo de habilidades (HU07)
  function handleAddSkill(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (skills.includes(trimmed)) {
      setSkillInput('')
      return
    }
    if (skills.length >= 15) {
      setError('Máximo permitido: 15 habilidades.')
      return
    }
    setError(null)
    setSkills([...skills, trimmed])
    setSkillInput('')
  }

  function handleRemoveSkill(skillToRemove: string) {
    setSkills(skills.filter((s) => s !== skillToRemove))
    setError(null)
  }

  // Validación y guardado
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    // Validar URLs si no están vacías (HU08)
    const urlPattern = /^https?:\/\//i
    if (portfolio.trim() && !urlPattern.test(portfolio.trim())) {
      setError('El enlace de Portafolio debe comenzar con http:// o https://')
      return
    }
    if (linkedin.trim() && !urlPattern.test(linkedin.trim())) {
      setError('El enlace de LinkedIn debe comenzar con http:// o https://')
      return
    }
    if (github.trim() && !urlPattern.test(github.trim())) {
      setError('El enlace de GitHub debe comenzar con http:// o https://')
      return
    }

    // Calcular disponibilidad (HU09)
    let finalAvailabilityText = ''
    let finalHours: number | undefined
    if (availabilityPreset === 'custom') {
      const parsedHours = Number(customHours)
      if (Number.isNaN(parsedHours) || parsedHours < 1 || parsedHours > 80) {
        setError('Las horas de disponibilidad personalizada deben estar entre 1 y 80.')
        return
      }
      finalHours = parsedHours
      finalAvailabilityText = `${parsedHours} h / semana`
    } else if (availabilityPreset) {
      finalAvailabilityText = availabilityPreset
      if (availabilityPreset.includes('–')) {
        const parts = availabilityPreset.split('–')[1]
        finalHours = Number.parseInt(parts, 10) || undefined
      }
    }

    setSaving(true)
    try {
      const updatePayload: UpdateProfileInput = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        occupation: occupation.trim() || undefined,
        location: location.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() === '' ? '' : avatarUrl,
        skills,
        availabilityText: finalAvailabilityText || undefined,
        availabilityHours: finalHours,
        links: {
          portfolio: portfolio.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
          github: github.trim() || undefined,
        },
      }

      const updated = await profileService.updateProfile(profile.userId, updatePayload)
      onProfileUpdated(updated)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  // Sugerencias de habilidades no agregadas
  const skillSuggestions = INITIAL_SKILLS_CATALOG.filter(
    (s) =>
      !skills.includes(s) &&
      (!skillInput || s.toLowerCase().includes(skillInput.toLowerCase())),
  ).slice(0, 5)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar perfil"
      description="Personaliza tu información para destacar en las postulaciones y proyectos."
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            loading={saving}
          >
            Guardar cambios
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert tone="error">{error}</Alert>}

        {/* 1. Foto de perfil (HU06) */}
        <div>
          <label className="text-sm font-semibold text-ink">Foto de perfil</label>
          <p className="text-xs text-muted mt-0.5">Formato JPG o PNG, tamaño máximo 2 MB.</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="size-20 shrink-0 overflow-hidden rounded-2xl bg-brand-100 ring-2 ring-line">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Vista previa avatar" className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center font-bold text-xl text-brand-700">
                  {firstName[0] || 'U'}{lastName[0] || ''}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                iconLeft={<Upload size={15} />}
                onClick={() => fileInputRef.current?.click()}
                loading={uploadingAvatar}
              >
                Subir foto
              </Button>
              {avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-danger-600 hover:bg-danger-50"
                  iconLeft={<Trash2 size={15} />}
                  onClick={handleRemoveAvatar}
                >
                  Quitar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Información básica */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <TextField
            label="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Ocupación o rol profesional"
            placeholder="Ej. Diseñadora de producto, Fullstack Dev"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
          />
          <TextField
            label="Ubicación"
            placeholder="Ej. Bogotá, Colombia"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Sobre mí */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="bio-input" className="text-sm font-semibold text-ink">
              Sobre mí
            </label>
            <span className="text-xs text-muted">{bio.length}/300</span>
          </div>
          <textarea
            id="bio-input"
            rows={3}
            maxLength={300}
            placeholder="Cuéntanos brevemente sobre ti, tus intereses y en qué tipo de proyectos te gustaría colaborar…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl border border-line bg-field p-3 text-[15px] text-ink outline-none transition-colors placeholder:text-subtle focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
        </div>

        {/* 3. Habilidades (HU07) */}
        <div className="border-t border-line pt-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-ink">Habilidades e intereses</label>
            <span className="text-xs font-medium text-muted">{skills.length} / 15</span>
          </div>
          <p className="text-xs text-muted mb-3">
            Escribe una habilidad y presiona Enter o elige de las sugerencias.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Agregar habilidad…"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddSkill(skillInput)
                }
              }}
              className="h-10 flex-1 rounded-xl border border-line bg-field px-3 text-sm text-ink outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              iconLeft={<Plus size={15} />}
              onClick={() => handleAddSkill(skillInput)}
              disabled={!skillInput.trim()}
            >
              Agregar
            </Button>
          </div>

          {/* Chips seleccionados */}
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="rounded-full hover:bg-brand-200 p-0.5 transition-colors"
                    aria-label={`Eliminar ${skill}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Sugerencias rápidas */}
          {skillSuggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted">Sugerencias:</span>
              {skillSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-muted hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Disponibilidad (HU09) */}
        <div className="border-t border-line pt-5">
          <label className="text-sm font-semibold text-ink">Disponibilidad semanal</label>
          <p className="text-xs text-muted mb-3">¿Cuánto tiempo puedes dedicar a proyectos?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AVAILABILITY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAvailabilityPreset(preset)}
                className={`rounded-xl border p-2.5 text-xs font-medium transition-all ${
                  availabilityPreset === preset
                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                    : 'border-line bg-surface text-ink hover:bg-white'
                }`}
              >
                {preset}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAvailabilityPreset('custom')}
              className={`rounded-xl border p-2.5 text-xs font-medium transition-all ${
                availabilityPreset === 'custom'
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                  : 'border-line bg-surface text-ink hover:bg-white'
              }`}
            >
              Horas específicas…
            </button>
          </div>

          {availabilityPreset === 'custom' && (
            <div className="mt-3">
              <TextField
                label="Horas semanales (1 a 80)"
                type="number"
                min={1}
                max={80}
                placeholder="Ej. 12"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* 5. Enlaces (HU08) */}
        <div className="border-t border-line pt-5 space-y-3.5">
          <div>
            <label className="text-sm font-semibold text-ink">Portafolio y redes profesionales</label>
            <p className="text-xs text-muted mt-0.5">
              Comparte tus enlaces para que los creadores de proyectos puedan evaluar tu trabajo.
            </p>
          </div>

          <TextField
            label="Portafolio personal"
            placeholder="https://tuportafolio.com"
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
          />
          <TextField
            label="LinkedIn"
            placeholder="https://linkedin.com/in/tu-usuario"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
          <TextField
            label="GitHub"
            placeholder="https://github.com/tu-usuario"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  )
}
