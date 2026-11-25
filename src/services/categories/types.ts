export interface Category {
  id: string
  name: string
  description: string
  slug: string
  color: string
  active: boolean
  projectsCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryInput {
  name: string
  description: string
  color?: string
  active?: boolean
}

export interface UpdateCategoryInput {
  name?: string
  description?: string
  color?: string
  active?: boolean
}

export type CategoryErrorCode =
  | 'NAME_REQUIRED'
  | 'DESCRIPTION_REQUIRED'
  | 'NAME_TAKEN'
  | 'CATEGORY_NOT_FOUND'
  | 'NOT_SUPPORTED'

export class CategoryError extends Error {
  readonly code: CategoryErrorCode
  constructor(code: CategoryErrorCode, message: string) {
    super(message)
    this.name = 'CategoryError'
    this.code = code
  }
}

export interface CategoryFilter {
  activeOnly?: boolean
  search?: string
}

/** Qué operaciones soporta la fuente de datos (el backend real es más acotado que el simulado). */
export interface CategoriesCapabilities {
  /** Descripción y color de cada categoría. */
  details: boolean
  /** Eliminación definitiva (el backend solo permite inactivar). */
  remove: boolean
}

export interface CategoriesService {
  readonly capabilities: CategoriesCapabilities
  getCategories(filter?: CategoryFilter): Promise<Category[]>
  getCategoryById(id: string): Promise<Category | null>
  createCategory(input: CreateCategoryInput): Promise<Category>
  updateCategory(id: string, input: UpdateCategoryInput): Promise<Category>
  toggleCategoryStatus(id: string): Promise<Category>
  deleteCategory(id: string): Promise<void>
  reset(): void
}
