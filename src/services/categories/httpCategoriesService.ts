import { ApiError, apiRequest } from '../http/apiClient'
import {
  CategoryError,
  type CategoriesService,
  type Category,
  type CategoryFilter,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from './types'

/** Categoría tal como la devuelve `/api/admin/categories`. */
interface ApiCategory {
  id: string | number
  name: string
  active: boolean
  projectCount: number
  createdAt: string
}

const NAME_TAKEN_MESSAGE = 'La categoría ingresada ya existe en el sistema.'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const toCategory = (c: ApiCategory): Category => ({
  id: String(c.id),
  name: c.name,
  slug: slugify(c.name),
  // El backend no guarda descripción ni color.
  description: '',
  color: 'brand',
  active: c.active,
  projectsCount: c.projectCount,
  createdAt: c.createdAt,
  updatedAt: c.createdAt,
})

function toCategoryError(err: unknown): never {
  if (err instanceof ApiError) {
    if (err.code === 'CATEGORY_EXISTS') throw new CategoryError('NAME_TAKEN', NAME_TAKEN_MESSAGE)
    if (err.code === 'CATEGORY_NOT_FOUND') throw new CategoryError('CATEGORY_NOT_FOUND', 'Categoría no encontrada.')
    if (err.code === 'VALIDATION') throw new CategoryError('NAME_REQUIRED', 'El nombre de la categoría es obligatorio.')
  }
  throw err
}

/** Implementación contra el backend real (`/api/admin/categories`, solo administradores). */
export class HttpCategoriesService implements CategoriesService {
  readonly capabilities = { details: false, remove: false }

  async getCategories(filter: CategoryFilter = {}): Promise<Category[]> {
    const rows = await apiRequest<ApiCategory[]>('/admin/categories')
    let list = rows.map(toCategory)
    if (filter.activeOnly) list = list.filter((c) => c.active)
    const q = filter.search?.trim().toLowerCase()
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q))
    return list
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return (await this.getCategories()).find((c) => c.id === id) ?? null
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const name = input.name?.trim() ?? ''
    if (!name) throw new CategoryError('NAME_REQUIRED', 'El nombre de la categoría es obligatorio.')
    try {
      const res = await apiRequest<{ category: ApiCategory }>('/admin/categories', {
        method: 'POST',
        body: { name },
      })
      const created = toCategory(res.category)
      // El backend crea la categoría activa; si se pidió inactiva, se desactiva enseguida.
      return input.active === false ? await this.updateCategory(created.id, { active: false }) : created
    } catch (err) {
      toCategoryError(err)
    }
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const body: { name?: string; active?: boolean } = {}
    if (input.name !== undefined) {
      const name = input.name.trim()
      if (!name) throw new CategoryError('NAME_REQUIRED', 'El nombre de la categoría es obligatorio.')
      body.name = name
    }
    if (input.active !== undefined) body.active = input.active
    try {
      const res = await apiRequest<{ category: ApiCategory }>(`/admin/categories/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body,
      })
      return toCategory(res.category)
    } catch (err) {
      toCategoryError(err)
    }
  }

  async toggleCategoryStatus(id: string): Promise<Category> {
    const current = await this.getCategoryById(id)
    if (!current) throw new CategoryError('CATEGORY_NOT_FOUND', 'Categoría no encontrada.')
    return this.updateCategory(id, { active: !current.active })
  }

  async deleteCategory(): Promise<void> {
    throw new CategoryError('NOT_SUPPORTED', 'El servidor solo permite inactivar categorías, no eliminarlas.')
  }

  reset(): void {
    /* sin estado local */
  }
}
