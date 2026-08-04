import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, string> = {
  primary: 'bg-vermilion text-white hover:bg-vermilion-dark',
  outline: 'border border-ink/30 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper',
  ghost: 'bg-transparent text-ink-soft hover:text-ink',
  danger: 'bg-white text-vermilion border border-vermilion/40 hover:bg-vermilion hover:text-white',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

interface ButtonBaseProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonProps = ButtonBaseProps &
  (
    | ({ href: string } & ComponentPropsWithoutRef<typeof Link>)
    | ({ href?: undefined } & ComponentPropsWithoutRef<'button'>)
  )

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  const classes = cn('btn', variantStyles[variant], sizeStyles[size], className)

  if ('href' in rest && rest.href) {
    const { href, ...linkRest } = rest
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...(rest as ComponentPropsWithoutRef<'button'>)}>
      {children}
    </button>
  )
}
