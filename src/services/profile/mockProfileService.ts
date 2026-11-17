import {
  ProfileError,
  type Profile,
  type ProfileService,
  type PublicProfile,
  type UpdateProfileInput,
} from './types'

const STORAGE_KEY = 'ideamatch_mock_profiles_v1'

export const INITIAL_SKILLS_CATALOG = [
  'Product Design',
  'Figma',
  'UX Research',
  'Design Systems',
  'Prototyping',
  'UI Design',
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'Python',
  'FastAPI',
  'Tailwind CSS',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Git',
  'Scrum / Ágil',
  'Testing / QA',
  'Product Management',
  'Data Analysis',
]

const SEED_PROFILES: Record<string, Profile> = {
  // User 1: Perfil completo (basado en Figma Perfil2.png)
  user1: {
    userId: 'user1',
    firstName: 'User',
    lastName: '1',
    occupation: 'Diseñadora de producto',
    location: 'Bogotá, Colombia',
    bio: 'Convierto problemas complejos en experiencias digitales sencillas. Me interesan los proyectos de impacto, la investigación y los equipos que aprenden construyendo.',
    skills: ['Product Design', 'Figma', 'UX Research', 'Design Systems', 'Prototyping'],
    availabilityHours: 15,
    availabilityText: '10–15 h / semana',
    links: {
      portfolio: 'https://marianasoto.design',
      linkedin: 'https://linkedin.com/in/marianasoto',
      github: 'https://github.com/marianasoto',
    },
    badges: ['Impulsor', 'Gran equipo'],
    verifiedExperiences: [
      {
        id: 'exp-1',
        projectName: 'Verde Cerca',
        role: 'UX Researcher',
        verifiedBy: 'equipo',
        year: '2025',
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  // User 2: Perfil vacío (basado en Figma Perfil1.png)
  user2: {
    userId: 'user2',
    firstName: 'User',
    lastName: '2',
    skills: [],
    links: {},
    badges: [],
    verifiedExperiences: [],
    updatedAt: new Date().toISOString(),
  },
  // Alias de compatibilidad para pruebas
  'usr-mariana': {
    userId: 'usr-mariana',
    firstName: 'Mariana',
    lastName: 'Soto',
    occupation: 'Diseñadora de producto',
    location: 'Bogotá, Colombia',
    bio: 'Convierto problemas complejos en experiencias digitales sencillas. Me interesan los proyectos de impacto, la investigación y los equipos que aprenden construyendo.',
    skills: ['Product Design', 'Figma', 'UX Research', 'Design Systems', 'Prototyping'],
    availabilityHours: 15,
    availabilityText: '10–15 h / semana',
    links: {
      portfolio: 'https://marianasoto.design',
      linkedin: 'https://linkedin.com/in/marianasoto',
      github: 'https://github.com/marianasoto',
    },
    badges: ['Impulsor', 'Gran equipo'],
    verifiedExperiences: [
      {
        id: 'exp-1',
        projectName: 'Verde Cerca',
        role: 'UX Researcher',
        verifiedBy: 'equipo',
        year: '2025',
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  'usr-daniel': {
    userId: 'usr-daniel',
    firstName: 'Daniel',
    lastName: 'Torres',
    skills: [],
    links: {},
    badges: [],
    verifiedExperiences: [],
    updatedAt: new Date().toISOString(),
  },
}

function isValidUrl(raw?: string): boolean {
  if (!raw || raw.trim() === '') return true
  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export class MockProfileService implements ProfileService {
  private getStore(): Record<string, Profile> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      let store: Record<string, Profile> = {}
      if (raw) {
        try {
          store = JSON.parse(raw) as Record<string, Profile>
        } catch {
          store = {}
        }
      }

      // Asegurar que los perfiles semilla (user1 y user2) siempre estén presentes
      let changed = false
      for (const [key, profile] of Object.entries(SEED_PROFILES)) {
        if (!store[key]) {
          store[key] = profile
          changed = true
        }
      }

      if (changed || !raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
      }
      return store
    } catch {
      return { ...SEED_PROFILES }
    }
  }

  private saveStore(store: Record<string, Profile>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch {
      // Ignorar cuotas de almacenamiento en entornos cerrados
    }
  }

  async getProfile(userId: string): Promise<Profile> {
    const store = this.getStore()
    const found = store[userId]
    if (found) return found

    // Si no existe pero es un usuario autenticado nuevo, inicializar perfil por defecto
    const newProfile: Profile = {
      userId,
      firstName: '',
      lastName: '',
      skills: [],
      links: {},
      badges: [],
      verifiedExperiences: [],
      updatedAt: new Date().toISOString(),
    }
    store[userId] = newProfile
    this.saveStore(store)
    return newProfile
  }

  async getPublicProfile(userId: string): Promise<PublicProfile | null> {
    const store = this.getStore()
    const p = store[userId]
    if (!p) return null

    return {
      userId: p.userId,
      fullName: `${p.firstName} ${p.lastName}`.trim(),
      firstName: p.firstName,
      lastName: p.lastName,
      occupation: p.occupation,
      location: p.location,
      bio: p.bio,
      avatarUrl: p.avatarUrl,
      skills: p.skills,
      availabilityText: p.availabilityText,
      links: p.links,
      badges: p.badges,
      verifiedExperiences: p.verifiedExperiences,
    }
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile> {
    const store = this.getStore()
    let current = store[userId]
    if (!current) {
      current = await this.getProfile(userId)
    }

    // Validación HU07: Habilidades entre 1 y 15 (si se envían habilidades)
    if (input.skills !== undefined) {
      if (input.skills.length > 15) {
        throw new ProfileError(
          'INVALID_SKILLS_COUNT',
          'No puedes seleccionar más de 15 habilidades.',
        )
      }
    }

    // Validación HU08: Enlaces válidos (http / https)
    if (input.links) {
      if (input.links.portfolio && !isValidUrl(input.links.portfolio)) {
        throw new ProfileError('INVALID_URL', 'El enlace de Portafolio debe comenzar con http:// o https://')
      }
      if (input.links.linkedin && !isValidUrl(input.links.linkedin)) {
        throw new ProfileError('INVALID_URL', 'El enlace de LinkedIn debe comenzar con http:// o https://')
      }
      if (input.links.github && !isValidUrl(input.links.github)) {
        throw new ProfileError('INVALID_URL', 'El enlace de GitHub debe comenzar con http:// o https://')
      }
    }

    // Validación HU09: Disponibilidad entre 1 y 80 horas semanales
    if (input.availabilityHours !== undefined) {
      if (input.availabilityHours < 1 || input.availabilityHours > 80) {
        throw new ProfileError(
          'INVALID_AVAILABILITY',
          'La disponibilidad horaria semanal debe estar entre 1 y 80 horas.',
        )
      }
    }

    let availabilityText = input.availabilityText
    if (input.availabilityHours !== undefined && !availabilityText) {
      availabilityText = `${input.availabilityHours} h / semana`
    }

    const updated: Profile = {
      ...current,
      firstName: input.firstName !== undefined ? input.firstName : current.firstName,
      lastName: input.lastName !== undefined ? input.lastName : current.lastName,
      occupation: input.occupation !== undefined ? input.occupation : current.occupation,
      location: input.location !== undefined ? input.location : current.location,
      bio: input.bio !== undefined ? input.bio : current.bio,
      avatarUrl: input.avatarUrl !== undefined ? (input.avatarUrl || undefined) : current.avatarUrl,
      skills: input.skills !== undefined ? input.skills : current.skills,
      availabilityHours:
        input.availabilityHours !== undefined ? input.availabilityHours : current.availabilityHours,
      availabilityText:
        availabilityText !== undefined ? availabilityText : current.availabilityText,
      links: input.links !== undefined ? { ...current.links, ...input.links } : current.links,
      updatedAt: new Date().toISOString(),
    }

    store[userId] = updated
    this.saveStore(store)
    return updated
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    // Validación HU06 / S2-T03: Foto JPG/PNG < 2 MB
    const maxSize = 2 * 1024 * 1024 // 2 MB
    if (file.size > maxSize) {
      throw new ProfileError(
        'FILE_TOO_LARGE',
        'El archivo supera el tamaño máximo permitido de 2 MB.',
      )
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new ProfileError(
        'INVALID_FILE_TYPE',
        'El formato no es compatible. Solo se permiten imágenes JPG o PNG.',
      )
    }

    // Convertir a Data URL para almacenar en localStorage y previsualizar de inmediato
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Error al procesar la imagen'))
      reader.readAsDataURL(file)
    })

    await this.updateProfile(userId, { avatarUrl: dataUrl })
    return dataUrl
  }

  async getCatalogSkills(): Promise<string[]> {
    return [...INITIAL_SKILLS_CATALOG]
  }

  /** Método auxiliar para pruebas: restablecer datos semilla */
  reset(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const profileService = new MockProfileService()
