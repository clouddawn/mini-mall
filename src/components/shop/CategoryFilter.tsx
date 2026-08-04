import Link from 'next/link'
import type { Category } from '@prisma/client'
import { cn } from '@/lib/utils'

type CategoryWithCount = Category & { _count: { products: number } }

interface CategoryFilterProps {
  categories: CategoryWithCount[]
  activeSlug?: string
  search?: string
}

/** 分类筛选侧栏：保留搜索词，切换分类时清空页码 */
export function CategoryFilter({ categories, activeSlug, search }: CategoryFilterProps) {
  const qs = (slug?: string) => {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    if (search) params.set('q', search)
    return params.toString() ? `?${params}` : ''
  }

  return (
    <nav className="space-y-1">
      <p className="mb-3 text-[10px] tracking-[0.3em] text-ink-faint uppercase">分类</p>
      <Link
        href={`/products${qs()}`}
        className={cn(
          'flex items-center justify-between px-3 py-2 text-sm transition-colors',
          !activeSlug ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5 hover:text-ink',
        )}
      >
        <span>全部商品</span>
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/products${qs(c.slug)}`}
          className={cn(
            'flex items-center justify-between px-3 py-2 text-sm transition-colors',
            activeSlug === c.slug ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5 hover:text-ink',
          )}
        >
          <span>{c.name}</span>
          <span className="num text-xs opacity-60">{c._count.products}</span>
        </Link>
      ))}
    </nav>
  )
}
