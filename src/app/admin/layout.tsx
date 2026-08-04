import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { LogoutButton } from '@/components/auth/LogoutButton'

export const metadata: Metadata = { title: '管理后台 · Mini Mall' }

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // 角色守卫：非管理员重定向回首页
  const session = await requireAdmin()
  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <div className="min-h-screen">
      {/* 后台顶栏 */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-xl font-semibold tracking-[0.15em]">MINI MALL</span>
            <span className="bg-vermilion px-1.5 py-0.5 text-[10px] tracking-[0.25em] text-white uppercase">
              管理后台
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-ink-soft transition-colors hover:text-ink">
              回到商城 →
            </Link>
            <span className="hidden text-xs text-ink-faint sm:inline">{user?.name ?? '管理员'}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl">
        <AdminSidebar />
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  )
}
