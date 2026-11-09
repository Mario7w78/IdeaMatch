import { useState, type ChangeEvent, type FormEvent } from 'react'

type Values = Record<string, string | boolean>
type Errors<T> = Partial<Record<keyof T, string>>

/**
 * Formulario con validación al salir del campo (blur) y al enviar.
 * Un error desaparece en cuanto el valor vuelve a ser válido.
 */
export function useForm<T extends Values>(initial: T, validate: (values: T) => Errors<T>) {
  const [values, setValues] = useState<T>(initial)
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)

  const allErrors = validate(values)
  const errors: Errors<T> = {}
  for (const key of Object.keys(allErrors) as (keyof T)[]) {
    if (submitted || touched[key]) errors[key] = allErrors[key]
  }

  function field<K extends keyof T>(name: K) {
    return {
      name: String(name),
      value: values[name] as string,
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        setValues((v) => ({ ...v, [name]: e.target.value })),
      onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
      error: errors[name],
    }
  }

  function checkbox<K extends keyof T>(name: K) {
    return {
      name: String(name),
      checked: values[name] as boolean,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        setValues((v) => ({ ...v, [name]: e.target.checked }))
        setTouched((t) => ({ ...t, [name]: true }))
      },
      error: errors[name],
    }
  }

  function handleSubmit(onValid: (values: T) => void | Promise<void>) {
    return (e: FormEvent) => {
      e.preventDefault()
      setSubmitted(true)
      if (Object.keys(validate(values)).length === 0) return onValid(values)
      // Llevar el foco al primer campo con error.
      const form = e.currentTarget as HTMLFormElement
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
    }
  }

  return { values, setValues, errors, field, checkbox, handleSubmit }
}
