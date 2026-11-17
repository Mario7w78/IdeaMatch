import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function FullPageLoader() {
  return (
    <div role="status" className="grid min-h-dvh place-items-center text-muted">
      <LoaderCircle className="animate-spin" aria-label="Cargando" />
    </div>
  )
}

/** Rutas privadas: sin sesión redirige al login recordando el destino. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageLoader />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

/** Login y registro: con sesión activa no tiene sentido mostrarlos. */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (session) return <Navigate to="/app" replace />
  return children
}
