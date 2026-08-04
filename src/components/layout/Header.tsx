import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { getSessionSafe } from '@/lib/auth'
import { LogoutButton } from '@/components/auth/LogoutButton'

function CartIcon({ count }: { count: number }) {
  return (
    <Link href="/cart" className="group relative flex items-center gap-1.5 text-ink-soft transition-colors hover:text-ink" aria-label="购物车">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 7h12l1.2 13H4.8L6 7Z" />
        <path d="M9 10V6a3 3 0 0 1 6 0v4" />
      </svg>
      {count > 0 && (
        <span className="num absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-vermilion px-1 text-[10px] text-white">
          {count}
        </span>
      )}
      <span className="hidden text-xs sm:inline">购物车</span>
    </Link>
  )
}

async function CartCount() {
  const session = await getSessionSafe()
  const count = session ? await prisma.cartItem.count({ where: { userId: session.userId } }) : 0
  return <CartIcon count={count} />
}

async function UserMenu() {
  const session = await getSessionSafe()
  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-xs tracking-widest text-ink-soft transition-colors hover:text-ink">
          登录
        </Link>
        <Link href="/register" className="btn bg-ink px-3 py-1.5 text-xs text-paper hover:bg-vermilion">
          注册
        </Link>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3">
      {session.role === 'ADMIN' && (
        <Link href="/admin" className="text-xs tracking-widest text-vermilion transition-colors hover:text-vermilion-dark">
          后台
        </Link>
      )}
      <span className="hidden text-xs text-ink-faint sm:inline">{session.role === 'ADMIN' ? '管理员' : ''}</span>
      <LogoutButton />
    </div>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-[0.15em]">MINI MALL</span>
          <span className="hidden text-[10px] tracking-[0.3em] text-ink-faint uppercase md:inline">精选好物</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/products" className="text-xs tracking-widest text-ink-soft transition-colors hover:text-ink">
            全部商品
          </Link>
          <Suspense fallback={<CartIcon count={0} />}>
            <CartCount />
          </Suspense>
          <Suspense fallback={null}>
            <UserMenu />
          </Suspense>
        </nav>
      </div>
    </header>
  )
}
