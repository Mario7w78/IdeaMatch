import { ButtonLink } from '../components/ui/Button'
import { Logo } from '../components/ui/Logo'

export function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-4">
      <div className="text-center">
        <Logo />
        <p className="mt-12 text-6xl font-bold text-brand-600">404</p>
        <h1 className="mt-3 text-2xl font-bold">No encontramos esta página</h1>
        <p className="mt-2 text-muted">Es posible que el enlace esté mal escrito o que la página ya no exista.</p>
        <ButtonLink to="/" className="mt-8">
          Ir al inicio
        </ButtonLink>
      </div>
    </main>
  )
}
