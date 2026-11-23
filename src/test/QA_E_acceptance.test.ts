import { beforeEach, describe, expect, it } from 'vitest'
import { MockPlatformService } from '../services/platform'

describe('QA-E · Pruebas de aceptación de HU41–HU43 (Métricas e Integraciones)', () => {
  let platform: MockPlatformService

  beforeEach(() => {
    platform = new MockPlatformService()
  })

  // --- HU41: Dashboard de Métricas e Indicadores de Uso ---
  describe('HU41 · Dashboard de Métricas e Indicadores de Uso', () => {
    it('calcula y consolida las métricas clave de la plataforma: proyectos activos, postulaciones y tasa de aceptación', () => {
      const metrics = platform.getMetrics()

      expect(metrics.totalUsers).toBeGreaterThan(0)
      expect(metrics.activeProjects).toBeGreaterThanOrEqual(1)
      expect(metrics.totalApplications).toBeGreaterThanOrEqual(1)
      expect(metrics.acceptanceRatePercentage).toBeGreaterThanOrEqual(0)
      expect(metrics.cachedAt).toBeDefined()

      platform.acceptApplication('app-1', 'user-creator-1')

      const updatedMetrics = platform.getMetrics()
      expect(updatedMetrics.acceptedApplications).toBe(1)
      expect(updatedMetrics.acceptanceRatePercentage).toBe(100)
    })
  })

  // --- HU42 / HU43: Integraciones Externas y Webhooks ---
  describe('HU42 / HU43 · Integraciones Externas (GitHub, Figma, Trello) y Webhooks', () => {
    it('permite a los creadores vincular URLs de repositorios de código y diseño en sus proyectos', () => {
      const updated = platform.updateProject('proj-1', 'user-creator-1', {
        githubUrl: 'https://github.com/ideamatch/ecotrack',
        figmaUrl: 'https://figma.com/file/abc123xyz/EcoTrack-Design',
        trelloUrl: 'https://trello.com/b/board123/ecotrack-sprints',
      })

      expect(updated.githubUrl).toBe('https://github.com/ideamatch/ecotrack')
      expect(updated.figmaUrl).toContain('figma.com')
      expect(updated.trelloUrl).toContain('trello.com')
    })

    it('procesa eventos entrantes de webhooks de plataformas externas cuando la firma es válida', () => {
      const result = platform.receiveWebhook(
        'github',
        { action: 'push', repository: 'ecotrack', commit: 'abc897' },
        'valid-webhook-secret',
      )

      expect(result.success).toBe(true)
      expect(result.eventId).toMatch(/^evt-/)

      const webhooks = platform.getReceivedWebhooks()
      expect(webhooks.some((w) => w.provider === 'github')).toBe(true)
    })

    it('rechaza webhooks con firma o secreto no autorizado (403)', () => {
      expect(() =>
        platform.receiveWebhook(
          'github',
          { action: 'push' },
          'secret-invalido',
        ),
      ).toThrow('Firma o secreto de webhook inválido.')
    })
  })
})
