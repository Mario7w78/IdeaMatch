import {
  CategoryError,
  type CategoriesService,
  type Category,
  type CategoryFilter,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from './types'

const STORAGE_KEY = 'ideamatch_mock_categories_v1'

const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Inteligencia Artificial',
    slug: 'inteligencia-artificial',
    description: 'Proyectos de machine learning, LLMs, visión computacional y automatización inteligente.',
    color: 'indigo',
    active: true,
    projectsCount: 14,
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Fintech & Finanzas',
    slug: 'fintech-finanzas',
    description: 'Plataformas de pagos, finanzas personales, microcréditos y tecnologías de contabilidad.',
    color: 'emerald',
    active: true,
    projectsCount: 8,
    createdAt: '2026-11-02T12:00:00.000Z',
    updatedAt: '2026-11-02T12:00:00.000Z',
  },
  {
    id: 'cat-3',
    name: 'Salud & Biotecnología',
    slug: 'salud-biotecnologia',
    description: 'Telemedicina, monitorización de pacientes, bioinformática y bienestar integral.',
    color: 'rose',
    active: true,
    projectsCount: 5,
    createdAt: '2026-11-03T14:00:00.000Z',
    updatedAt: '2026-11-03T14:00:00.000Z',
  },
  {
    id: 'cat-4',
    name: 'Educación Tech',
    slug: 'educacion-tech',
    description: 'Herramientas interactivas de aprendizaje, plataformas de cursos y gestión escolar.',
    color: 'amber',
    active: true,
    projectsCount: 11,
    createdAt: '2026-11-04T15:30:00.000Z',
    updatedAt: '2026-11-04T15:30:00.000Z',
  },
  {
    id: 'cat-5',
    name: 'Sostenibilidad & Clima',
    slug: 'sostenibilidad-clima',
    description: 'Energías limpias, reducción de huella de carbono, economía circular y reciclaje.',
    color: 'teal',
    active: true,
    projectsCount: 7,
    createdAt: '2026-11-05T09:15:00.000Z',
    updatedAt: '2026-11-05T09:15:00.000Z',
  },
  {
    id: 'cat-6',
    name: 'E-commerce & Retail',
    slug: 'e-commerce-retail',
    description: 'Marketplaces especializados, optimización logística y experiencias de compra digital.',
    color: 'blue',
    active: true,
    projectsCount: 6,
    createdAt: '2026-11-06T11:45:00.000Z',
    updatedAt: '2026-11-06T11:45:00.000Z',
  },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export class MockCategoriesService implements CategoriesService {
  readonly capabilities = { details: true, remove: true }

  private load(): Category[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as Category[]
    } catch {
      /* fallback */
    }
    return structuredClone(SEED_CATEGORIES)
  }

  private save(categories: Category[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  }

  async getCategories(filter: CategoryFilter = {}): Promise<Category[]> {
    let result = this.load()
    if (filter.activeOnly) {
      result = result.filter((c) => c.active)
    }
    if (filter.search?.trim()) {
      const query = filter.search.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.slug.includes(query),
      )
    }
    return result
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const list = this.load()
    return list.find((c) => c.id === id) ?? null
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const trimmedName = input.name?.trim() ?? ''
    const trimmedDesc = input.description?.trim() ?? ''

    if (!trimmedName) {
      throw new CategoryError('NAME_REQUIRED', 'El nombre de la categoría es obligatorio.')
    }
    if (!trimmedDesc) {
      throw new CategoryError('DESCRIPTION_REQUIRED', 'La descripción de la categoría es obligatoria.')
    }

    const all = this.load()
    const isDuplicate = all.some((c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase())
    if (isDuplicate) {
      throw new CategoryError('NAME_TAKEN', 'La categoría ingresada ya existe en el sistema.')
    }

    const dateStr = new Date().toISOString()
    const newCategory: Category = {
      id: `cat-${crypto.randomUUID()}`,
      name: trimmedName,
      description: trimmedDesc,
      slug: slugify(trimmedName),
      color: input.color ?? 'brand',
      active: input.active ?? true,
      projectsCount: 0,
      createdAt: dateStr,
      updatedAt: dateStr,
    }

    all.push(newCategory)
    this.save(all)
    return newCategory
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const all = this.load()
    const existing = all.find((c) => c.id === id)
    if (!existing) {
      throw new CategoryError('CATEGORY_NOT_FOUND', 'Categoría no encontrada.')
    }

    let updatedName = existing.name
    if (input.name !== undefined) {
      const trimmed = input.name.trim()
      if (!trimmed) {
        throw new CategoryError('NAME_REQUIRED', 'El nombre de la categoría es obligatorio.')
      }
      const duplicate = all.some(
        (c) => c.id !== id && c.name.trim().toLowerCase() === trimmed.toLowerCase(),
      )
      if (duplicate) {
        throw new CategoryError('NAME_TAKEN', 'La categoría ingresada ya existe en el sistema.')
      }
      updatedName = trimmed
    }

    let updatedDesc = existing.description
    if (input.description !== undefined) {
      const trimmed = input.description.trim()
      if (!trimmed) {
        throw new CategoryError('DESCRIPTION_REQUIRED', 'La descripción de la categoría es obligatoria.')
      }
      updatedDesc = trimmed
    }

    const updatedCategory: Category = {
      ...existing,
      name: updatedName,
      description: updatedDesc,
      slug: slugify(updatedName),
      color: input.color ?? existing.color,
      active: input.active !== undefined ? input.active : existing.active,
      updatedAt: new Date().toISOString(),
    }

    const updatedList = all.map((c) => (c.id === id ? updatedCategory : c))
    this.save(updatedList)
    return updatedCategory
  }

  async toggleCategoryStatus(id: string): Promise<Category> {
    const all = this.load()
    const existing = all.find((c) => c.id === id)
    if (!existing) {
      throw new CategoryError('CATEGORY_NOT_FOUND', 'Categoría no encontrada.')
    }
    const updated: Category = {
      ...existing,
      active: !existing.active,
      updatedAt: new Date().toISOString(),
    }
    this.save(all.map((c) => (c.id === id ? updated : c)))
    return updated
  }

  async deleteCategory(id: string): Promise<void> {
    const all = this.load()
    const filtered = all.filter((c) => c.id !== id)
    if (filtered.length === all.length) {
      throw new CategoryError('CATEGORY_NOT_FOUND', 'Categoría no encontrada.')
    }
    this.save(filtered)
  }

  reset(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const categoriesService = new MockCategoriesService()
