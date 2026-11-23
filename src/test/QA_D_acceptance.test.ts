import { beforeEach, describe, expect, it } from 'vitest'
import { MockCategoriesService } from '../services/categories'

describe('QA-D · Pruebas de aceptación de HU40 (Gestión de Categorías del Sistema)', () => {
  let categories: MockCategoriesService

  beforeEach(() => {
    localStorage.clear()
    categories = new MockCategoriesService()
  })

  it('permite al administrador crear una categoría nueva que queda disponible de inmediato', async () => {
    const newCat = await categories.createCategory({
      name: 'Salud Digital',
      description: 'Tecnologías para optimizar el diagnóstico médico y la atención remota.',
      color: 'emerald',
      active: true,
    })

    expect(newCat.id).toBeDefined()
    expect(newCat.name).toBe('Salud Digital')
    expect(newCat.slug).toBe('salud-digital')
    expect(newCat.active).toBe(true)

    const list = await categories.getCategories({ activeOnly: true })
    expect(list.some((c) => c.name === 'Salud Digital')).toBe(true)
  })

  it('rechaza categorías con nombres duplicados con el mensaje exacto: «La categoría ingresada ya existe en el sistema»', async () => {
    await categories.createCategory({
      name: 'Biotecnología',
      description: 'Ciencias biológicas aplicadas',
    })

    await expect(
      categories.createCategory({
        name: 'biotecnología',
        description: 'Otro intento',
      }),
    ).rejects.toThrow('La categoría ingresada ya existe en el sistema.')
  })

  it('permite inactivar una categoría para que no sea visible en el formulario de nuevos proyectos', async () => {
    const created = await categories.createCategory({
      name: 'Tecnología Aeroespacial',
      description: 'Satélites y drones de órbita baja',
      active: true,
    })

    const toggled = await categories.toggleCategoryStatus(created.id)
    expect(toggled.active).toBe(false)

    const activeList = await categories.getCategories({ activeOnly: true })
    expect(activeList.some((c) => c.id === created.id)).toBe(false)

    const allList = await categories.getCategories()
    expect(allList.some((c) => c.id === created.id)).toBe(true)
  })
})
