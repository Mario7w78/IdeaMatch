import { useState, type FormEvent } from 'react'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { TextField } from '../ui/TextField'
import {
  categoriesService,
  CategoryError,
  type Category,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '../../services/categories'

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  categoryToEdit?: Category | null
  onSaved?: (category: Category) => void
}

const COLOR_OPTIONS = [
  { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'rose', label: 'Rosa', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'amber', label: 'Ámbar', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'teal', label: 'Turquesa', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 'blue', label: 'Azul', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
]

export function CategoryModal({ open, onClose, categoryToEdit, onSaved }: CategoryModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={categoryToEdit ? 'Editar categoría' : 'Nueva categoría del sistema'}
      description="HU38 · Clasificación y gobierno del catálogo de proyectos"
      maxWidth="lg"
    >
      <CategoryForm key={categoryToEdit?.id ?? 'new-cat'} categoryToEdit={categoryToEdit} onClose={onClose} onSaved={onSaved} />
    </Modal>
  )
}

function CategoryForm({
  categoryToEdit,
  onClose,
  onSaved,
}: {
  categoryToEdit?: Category | null
  onClose: () => void
  onSaved?: (category: Category) => void
}) {
  const [name, setName] = useState(categoryToEdit?.name ?? '')
  const [description, setDescription] = useState(categoryToEdit?.description ?? '')
  const [color, setColor] = useState(categoryToEdit?.color ?? 'indigo')
  const [active, setActive] = useState(categoryToEdit?.active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio.')
      return
    }
    if (!description.trim()) {
      setError('La descripción de la categoría es obligatoria.')
      return
    }

    setBusy(true)
    try {
      let saved: Category
      if (categoryToEdit) {
        const payload: UpdateCategoryInput = {
          name: name.trim(),
          description: description.trim(),
          color,
          active,
        }
        saved = await categoriesService.updateCategory(categoryToEdit.id, payload)
      } else {
        const payload: CreateCategoryInput = {
          name: name.trim(),
          description: description.trim(),
          color,
          active,
        }
        saved = await categoriesService.createCategory(payload)
      }
      onSaved?.(saved)
      onClose()
    } catch (err) {
      if (err instanceof CategoryError || err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error al guardar la categoría.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert tone="error">
          <span className="font-semibold">{error}</span>
        </Alert>
      )}

      <TextField
        label="Nombre de la categoría"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej. Biotecnología, Robótica, IA…"
        required
        autoFocus
      />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="cat-desc" className="text-sm font-semibold text-ink">
            Descripción
          </label>
          <span className="text-xs text-subtle">{description.length}/300</span>
        </div>
        <textarea
          id="cat-desc"
          rows={3}
          maxLength={300}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explica qué tipo de ideas o proyectos pertenecen a esta categoría…"
          required
          className="w-full rounded-xl border border-line bg-field p-3.5 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">Paleta y distintivo</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setColor(opt.id)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${opt.bg} ${
                color === opt.id ? 'ring-2 ring-brand-600 ring-offset-2' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <input
          id="cat-active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="size-4 rounded-md border-line text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="cat-active" className="text-sm font-medium text-ink cursor-pointer">
          Categoría activa (visible para nuevos proyectos y filtros de búsqueda)
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
        <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button type="submit" loading={busy}>
          {categoryToEdit ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </div>
    </form>
  )
}
