export type Variant = 'primary' | 'secondary' | 'ghost' | 'link'
export type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-[0_6px_16px_-6px_rgb(102_80_230/0.6)]',
  secondary: 'border border-line bg-white text-ink hover:border-brand-300 hover:bg-brand-50',
  ghost: 'text-muted hover:bg-surface hover:text-ink',
  link: 'text-brand-700 hover:text-brand-800 hover:underline underline-offset-4 px-0! h-auto!',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-14 px-6 text-base',
}

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`
}

