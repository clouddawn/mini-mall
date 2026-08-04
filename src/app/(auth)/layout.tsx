import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-10 block text-center">
        <span className="font-display text-3xl font-semibold tracking-widest">MINI MALL</span>
        <span className="mt-1 block text-xs tracking-[0.4em] text-ink-faint uppercase">微型精品商城</span>
      </Link>
      <div className="w-full max-w-sm border border-line bg-card p-8 shadow-[0_8px_30px_rgba(28,26,23,0.06)]">
        {children}
      </div>
    </div>
  )
}
