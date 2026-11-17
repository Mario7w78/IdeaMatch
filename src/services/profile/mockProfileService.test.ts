import { beforeEach, describe, expect, it } from 'vitest'
import { MockProfileService } from './mockProfileService'
import { ProfileError } from './types'

describe('MockProfileService', () => {
  let service: MockProfileService

  beforeEach(() => {
    localStorage.clear()
    service = new MockProfileService()
  })

  describe('HU06 - Información personal y foto', () => {
    it('obtiene el perfil existente con datos semilla', async () => {
      const profile = await service.getProfile('usr-mariana')
      expect(profile.firstName).toBe('Mariana')
      expect(profile.lastName).toBe('Soto')
      expect(profile.occupation).toBe('Diseñadora de producto')
      expect(profile.location).toBe('Bogotá, Colombia')
    })

    it('actualiza información personal con éxito', async () => {
      const updated = await service.updateProfile('usr-mariana', {
        occupation: 'Lead Product Designer',
        bio: 'Nueva biografía de prueba',
        location: 'Medellín, Colombia',
      })
      expect(updated.occupation).toBe('Lead Product Designer')
      expect(updated.bio).toBe('Nueva biografía de prueba')
      expect(updated.location).toBe('Medellín, Colombia')
    })

    it('permite subir una foto menor a 2 MB en formato PNG o JPG', async () => {
      const smallFile = new File(['fake-image-bytes'], 'avatar.png', { type: 'image/png' })
      const url = await service.uploadAvatar('usr-mariana', smallFile)
      expect(url).toContain('data:image/png')

      const profile = await service.getProfile('usr-mariana')
      expect(profile.avatarUrl).toBe(url)
    })

    it('rechaza una foto mayor a 2 MB con error FILE_TOO_LARGE', async () => {
      // 2.5 MB
      const bigBlob = new Uint8Array(2.5 * 1024 * 1024)
      const bigFile = new File([bigBlob], 'heavy.png', { type: 'image/png' })

      await expect(service.uploadAvatar('usr-mariana', bigFile)).rejects.toThrowError(
        ProfileError,
      )
      await expect(service.uploadAvatar('usr-mariana', bigFile)).rejects.toMatchObject({
        code: 'FILE_TOO_LARGE',
      })
    })

    it('rechaza un archivo de tipo no admitido (ej. PDF o GIF)', async () => {
      const invalidFile = new File(['text'], 'doc.pdf', { type: 'application/pdf' })
      await expect(service.uploadAvatar('usr-mariana', invalidFile)).rejects.toMatchObject({
        code: 'INVALID_FILE_TYPE',
      })
    })
  })

  describe('HU07 - Configuración de habilidades e intereses', () => {
    it('retorna el catálogo base de habilidades', async () => {
      const skills = await service.getCatalogSkills()
      expect(skills).toContain('Product Design')
      expect(skills).toContain('Figma')
      expect(skills).toContain('TypeScript')
    })

    it('permite actualizar hasta 15 habilidades válidas', async () => {
      const newSkills = ['React', 'TypeScript', 'Tailwind CSS']
      const updated = await service.updateProfile('usr-mariana', { skills: newSkills })
      expect(updated.skills).toEqual(newSkills)
    })

    it('rechaza si se intentan registrar más de 15 habilidades', async () => {
      const tooManySkills = Array.from({ length: 16 }, (_, i) => `Skill ${i + 1}`)
      await expect(
        service.updateProfile('usr-mariana', { skills: tooManySkills }),
      ).rejects.toMatchObject({
        code: 'INVALID_SKILLS_COUNT',
      })
    })
  })

  describe('HU08 - Enlaces profesionales y portafolio', () => {
    it('acepta enlaces válidos con http o https', async () => {
      const validLinks = {
        portfolio: 'https://miportafolio.dev',
        linkedin: 'https://linkedin.com/in/usuario',
        github: 'https://github.com/usuario',
      }
      const updated = await service.updateProfile('usr-mariana', { links: validLinks })
      expect(updated.links.portfolio).toBe('https://miportafolio.dev')
      expect(updated.links.linkedin).toBe('https://linkedin.com/in/usuario')
      expect(updated.links.github).toBe('https://github.com/usuario')
    })

    it('rechaza enlaces con protocolo inválido o texto plano', async () => {
      await expect(
        service.updateProfile('usr-mariana', {
          links: { portfolio: 'ftp://inseguro.com' },
        }),
      ).rejects.toMatchObject({
        code: 'INVALID_URL',
      })

      await expect(
        service.updateProfile('usr-mariana', {
          links: { linkedin: 'no-es-una-url' },
        }),
      ).rejects.toMatchObject({
        code: 'INVALID_URL',
      })
    })
  })

  describe('HU09 - Configuración de disponibilidad horaria', () => {
    it('permite configurar horas semanales entre 1 y 80', async () => {
      const updated = await service.updateProfile('usr-mariana', {
        availabilityHours: 20,
        availabilityText: '15–20 h / semana',
      })
      expect(updated.availabilityHours).toBe(20)
      expect(updated.availabilityText).toBe('15–20 h / semana')
    })

    it('rechaza horas menores a 1 o mayores a 80', async () => {
      await expect(
        service.updateProfile('usr-mariana', { availabilityHours: 0 }),
      ).rejects.toMatchObject({
        code: 'INVALID_AVAILABILITY',
      })

      await expect(
        service.updateProfile('usr-mariana', { availabilityHours: 85 }),
      ).rejects.toMatchObject({
        code: 'INVALID_AVAILABILITY',
      })
    })
  })

  describe('HU10 - Vista pública del perfil', () => {
    it('devuelve el DTO público sin campos de control interno', async () => {
      const publicData = await service.getPublicProfile('usr-mariana')
      expect(publicData).not.toBeNull()
      expect(publicData?.fullName).toBe('Mariana Soto')
      expect(publicData?.occupation).toBe('Diseñadora de producto')
      expect(publicData?.skills).toContain('Figma')
      expect(publicData?.links.linkedin).toBe('https://linkedin.com/in/marianasoto')
      // No debe contener campos internos o privados
      expect((publicData as unknown as Record<string, unknown>).updatedAt).toBeUndefined()
    })

    it('retorna null si el perfil no existe', async () => {
      const publicData = await service.getPublicProfile('usuario-inexistente')
      expect(publicData).toBeNull()
    })
  })
})
