export interface SocialLinks {
  portfolio?: string
  linkedin?: string
  github?: string
}

export interface VerifiedExperience {
  id: string
  projectName: string
  role: string
  verifiedBy: string
  year: string
}

export interface Profile {
  userId: string
  firstName: string
  lastName: string
  occupation?: string
  location?: string
  bio?: string
  avatarUrl?: string
  skills: string[]
  availabilityHours?: number
  availabilityText?: string
  links: SocialLinks
  badges: string[]
  verifiedExperiences: VerifiedExperience[]
  updatedAt: string
}

/** DTO público: excluye campos sensibles y de contacto privado. */
export interface PublicProfile {
  userId: string
  fullName: string
  firstName: string
  lastName: string
  occupation?: string
  location?: string
  bio?: string
  avatarUrl?: string
  skills: string[]
  availabilityText?: string
  links: SocialLinks
  badges: string[]
  verifiedExperiences: VerifiedExperience[]
}

export interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  occupation?: string
  location?: string
  bio?: string
  avatarUrl?: string
  skills?: string[]
  availabilityHours?: number
  availabilityText?: string
  links?: SocialLinks
}

export type ProfileErrorCode =
  | 'PROFILE_NOT_FOUND'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'INVALID_SKILLS_COUNT'
  | 'INVALID_URL'
  | 'INVALID_AVAILABILITY'

export class ProfileError extends Error {
  readonly code: ProfileErrorCode
  constructor(code: ProfileErrorCode, message: string) {
    super(message)
    this.name = 'ProfileError'
    this.code = code
  }
}

export interface ProfileService {
  getProfile(userId: string): Promise<Profile>
  getPublicProfile(userId: string): Promise<PublicProfile | null>
  updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile>
  uploadAvatar(userId: string, file: File): Promise<string>
  getCatalogSkills(): Promise<string[]>
}
