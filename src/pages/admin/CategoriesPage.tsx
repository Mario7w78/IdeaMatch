import { Edit2, LoaderCircle, Plus, Power, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CategoryModal } from '../../components/categories/CategoryModal'
import { categoriesService, type Category } from '../../services/categories'

type Filter = 'all' | 'active' | 'inactive'

export function CategoriesPage() {
  const { details, remove } = categoriesService.capabilities
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [target, setTarget] = useState<Category | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const load = useCallback(async () => {
    const list = await categoriesService.getCategories()
    return list
  }, [])

  useEffect(() => {
    let active = true
    load().then((list) => {
      if (active) setCategories(list)
    })
    return () => {
      active = false
    }
  }, [load])

  async function handleToggleStatus(cat: Category) {
    try {
      const updated = await categoriesService.toggleCategoryStatus(cat.id)
      setFeedback({
        tone: 'success',
        text: `Categoría «${updated.name}» ${updated.active ? 'activada' : 'inactivada'}.`,
      })
      const list = await load()
      setCategories(list)
    } catch (err) {
      setFeedback({ tone: 'error', text: err instanceof Error ? err.message : 'Error al cambiar el estado.' })
    }
  }

  async function handleDelete(cat: Category) {
    if (!window.confirm(`¿Eliminar la categoría «${cat.name}»?`)) return
    try {
      await categoriesService.deleteCategory(cat.id)
      setFeedback({ tone: 'success', text: `Categoría «${cat.name}» eliminada.` })
      const list = await load()
      setCategories(list)
    } catch {
      setFeedback({ tone: 'error', text: 'Error al eliminar la categoría.' })
    }
  }

  const allCategories = categories ?? []
  const filtered = allCategories.filter((c) => {
    if (filter === 'active' && !c.active) return false
    if (filter === 'inactive' && c.active) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.includes(q)
      )
    }
    return true
  })

  const totalCount = allCategories.length
  const activeCount = allCategories.filter((c) => c.active).length
  const inactiveCount = totalCount - activeCount

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-brand-700 uppercase">Administración</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Gestión de Categorías</h1>
          <p className="mt-2 text-muted">HU38 · Administra las clasificaciones globales para los proyectos del catálogo.</p>
        </div>

        <Button
          onClick={() => {
            setTarget(null)
            setModalOpen(true)
          }}
          iconLeft={<Plus size={18} />}
        >
          Nueva categoría
        </Button>
      </div>

      {feedback && (
        <div className="mt-6">
          <Alert tone={feedback.tone}>{feedback.text}</Alert>
        </div>
      )}

      {/* Barra de filtros */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filtrar categorías" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
              filter === 'all'
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line bg-white text-muted hover:border-brand-300 hover:text-ink'
            }`}
          >
            Todas ({totalCount})
          </button>
          <button
            type="button"
            aria-pressed={filter === 'active'}
            onClick={() => setFilter('active')}
            className={`h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
              filter === 'active'
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line bg-white text-muted hover:border-brand-300 hover:text-ink'
            }`}
          >
            Activas ({activeCount})
          </button>
          <button
            type="button"
            aria-pressed={filter === 'inactive'}
            onClick={() => setFilter('inactive')}
            className={`h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
              filter === 'inactive'
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line bg-white text-muted hover:border-brand-300 hover:text-ink'
            }`}
          >
            Inactivas ({inactiveCount})
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute top-3 left-3 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={details ? 'Buscar por nombre o descripción…' : 'Buscar por nombre…'}
            aria-label="Buscar categorías"
            className="w-full rounded-xl border border-line bg-field py-2 pr-4 pl-9 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-brand-500 focus:bg-white"
          />
        </div>
      </div>

      {!categories ? (
        <div role="status" className="grid place-items-center py-20 text-muted">
          <LoaderCircle className="animate-spin" aria-label="Cargando categorías" />
        </div>
      ) : filtered.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-line bg-white p-12 text-center text-muted">
          No se encontraron categorías con los criterios seleccionados.
        </section>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface/80 text-xs font-semibold text-muted">
                  <th className="px-6 py-4">Categoría</th>
                  {details && <th className="px-6 py-4">Descripción</th>}
                  <th className="px-6 py-4 text-center">Proyectos</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((cat) => (
                  <tr key={cat.id} className="transition-colors hover:bg-surface/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-brand-100 font-semibold text-xs text-brand-700">
                          {cat.name.substring(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-ink">{cat.name}</p>
                          <p className="text-xs text-subtle">/{cat.slug}</p>
                        </div>
                      </div>
                    </td>
                    {details && (
                      <td className="max-w-xs px-6 py-4 text-muted">
                        <p className="line-clamp-2">{cat.description}</p>
                      </td>
                    )}
                    <td className="px-6 py-4 text-center font-medium text-ink">
                      {cat.projectsCount}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <Badge tone={cat.active ? 'success' : 'neutral'}>
                        {cat.active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setTarget(cat)
                            setModalOpen(true)
                          }}
                          className="rounded-lg p-2 text-muted hover:bg-surface hover:text-ink transition-colors"
                          title="Editar categoría"
                          aria-label={`Editar ${cat.name}`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          className={`rounded-lg p-2 transition-colors ${
                            cat.active
                              ? 'text-muted hover:bg-danger-50 hover:text-danger-600'
                              : 'text-success-600 hover:bg-success-50'
                          }`}
                          title={cat.active ? 'Inactivar categoría' : 'Activar categoría'}
                          aria-label={`${cat.active ? 'Inactivar' : 'Activar'} ${cat.name}`}
                        >
                          <Power size={16} />
                        </button>
                        {remove && (
                          <button
                            onClick={() => handleDelete(cat)}
                            className="rounded-lg p-2 text-muted hover:bg-danger-50 hover:text-danger-600 transition-colors"
                            title="Eliminar categoría"
                            aria-label={`Eliminar ${cat.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setTarget(null)
        }}
        categoryToEdit={target}
        onSaved={async (saved) => {
          setFeedback({
            tone: 'success',
            text: target ? `Categoría «${saved.name}» actualizada.` : `Categoría «${saved.name}» creada.`,
          })
          const list = await load()
          setCategories(list)
        }}
      />
    </div>
  )
}
