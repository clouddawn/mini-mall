import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, id, ...rest }: InputProps) {
  const inputId = id ?? rest.name
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium tracking-widest text-ink-soft uppercase">
          {label}
        </label>
      )}
      <input id={inputId} className={cn('input-base', error && 'border-vermilion', className)} {...rest} />
      {error ? (
        <p className="text-xs text-vermilion">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}
