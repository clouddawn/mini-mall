import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('border border-line bg-card p-6 shadow-[0_1px_0_rgba(28,26,23,0.04)]', className)}>
      {children}
    </div>
  )
}
