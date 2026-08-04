'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: '仪表板', icon: '◈' },
  { href: '/admin/products', label: '商品管理', icon: '□' },
  { href: '/admin/categories', label: '分类管理', icon: '⌗' },
  { href: '/admin/orders', label: '订单管理', icon: '▤' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-48 shrink-0 border-r border-line bg-card">
      <nav className="sticky top-16 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                active ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5 hover:text-ink',
              )}
            >
              <span className="text-xs opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
