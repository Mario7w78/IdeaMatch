const COVERS = [
  'from-brand-100 to-brand-300',
  'from-brand-200 to-brand-50',
  'from-success-50 to-brand-200',
  'from-orange-100 to-brand-100',
  'from-brand-50 to-brand-400',
]

/** Portada degradada estable por categoría. */
export function coverFor(category: string): string {
  let hash = 0
  for (const ch of category) hash = (hash * 31 + ch.charCodeAt(0)) % COVERS.length
  return COVERS[hash]
}
