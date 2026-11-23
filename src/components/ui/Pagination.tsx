import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

/** Paginación simple: «Anterior», «Página X de Y», «Siguiente». */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-4">
      <Button
        variant="secondary"
        size="sm"
        iconLeft={<ChevronLeft size={16} aria-hidden="true" />}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Anterior
      </Button>
      <span className="text-sm text-muted" aria-live="polite">
        Página {page} de {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        iconRight={<ChevronRight size={16} aria-hidden="true" />}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Siguiente
      </Button>
    </nav>
  )
}
