import { beforeEach, describe, expect, it } from 'vitest'
import { MockCategoriesService } from './mockCategoriesService'
import { CategoryError } from './types'

describe('MockCategoriesService (HU38)', () => {
  let service: MockCategoriesService

  beforeEach(() => {
    localStorage.clear()
    service = new MockCategoriesService()
  })

  it('lista las categorías base del catálogo', async () => {
    const list = await service.getCategories()
    expect(list.length).toBeGreaterThanOrEqual(6)
    expect(list.some((c) => c.name === 'Inteligencia Artificial')).toBe(true)
  })

  it('permite crear una nueva categoría válida (ej. Biotecnología)', async () => {
    const created = await service.createCategory({
      name: 'Biotecnología',
      description: 'Innovaciones biológicas y genéticas.',
      color: 'teal',
    })

    expect(created.id).toBeDefined()
    expect(created.name).toBe('Biotecnología')
    expect(created.slug).toBe('biotecnologia')
    expect(created.active).toBe(true)
  })

  it('rechaza categorías con nombre repetido con: «La categoría ingresada ya existe en el sistema»', async () => {
    await service.createCategory({
      name: 'Biotecnología',
      description: 'Primera descripción',
    })

    await expect(
      service.createCategory({
        name: 'biotecnología',
        description: 'Intento duplicado',
      }),
    ).rejects.toThrow('La categoría ingresada ya existe en el sistema.')

    const err = await service
      .createCategory({
        name: '  BIOTECNOLOGÍA  ',
        description: 'Tercer intento',
      })
      .catch((e: unknown) => e)

    expect(err).toBeInstanceOf(CategoryError)
    expect((err as CategoryError).code).toBe('NAME_TAKEN')
  })

  it('valida que el nombre y descripción no estén vacíos', async () => {
    await expect(
      service.createCategory({
        name: '',
        description: 'Válida',
      }),
    ).rejects.toThrow('El nombre de la categoría es obligatorio.')

    await expect(
      service.createCategory({
        name: 'Válido',
        description: '   ',
      }),
    ).rejects.toThrow('La descripción de la categoría es obligatoria.')
  })

  it('permite alternar el estado de activación de una categoría', async () => {
    const list = await service.getCategories()
    const target = list[0]

    const toggled = await service.toggleCategoryStatus(target.id)
    expect(toggled.active).toBe(false)

    const activeList = await service.getCategories({ activeOnly: true })
    expect(activeList.some((c) => c.id === target.id)).toBe(false)
  })
})
