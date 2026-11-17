import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { buttonClasses, type Size, type Variant } from './buttonClasses'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  iconRight?: ReactNode
  iconLeft?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  )
}

interface ButtonLinkProps {
  to: string
  variant?: Variant
  size?: Size
  className?: string
  iconRight?: ReactNode
  iconLeft?: ReactNode
  children: ReactNode
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  iconLeft,
  iconRight,
  children,
}: ButtonLinkProps) {
  return (
    <Link to={to} className={buttonClasses(variant, size, className)}>
      {iconLeft}
      {children}
      {iconRight}
    </Link>
  )
}
