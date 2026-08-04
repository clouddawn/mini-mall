import type { Metadata } from 'next'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { SearchBar } from '@/components/shop/SearchBar'
import { CategoryFilter } from '@/components/shop/CategoryFilter'
import { Pagination } from '@/components/ui/Pagination'

export const metadata: Metadata = { title: '全部商品 · Mini Mall' }

const PAGE_SIZE = 12

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const search = params.q?.trim() ?? ''
  const categorySlug = params.category ?? ''
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)

  const where: Prisma.ProductWhereInput = {
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const activeCategory = categories.find((c) => c.slug === categorySlug)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* 页头 */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">
            {search ? '搜索结果' : '全部商品'} {categorySlug && `· ${activeCategory?.name ?? ''}`}
          </p>
          <h1 className="font-display mt-1 text-3xl font-semibold">
            {search ? `「${search}」` : activeCategory?.name ?? '全部商品'}
          </h1>
          <p className="num mt-1 text-xs text-ink-faint">共 {total} 件</p>
        </div>
        <div className="w-full sm:w-72">
          <SearchBar defaultValue={search} />
        </div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-44">
          <CategoryFilter categories={categories} activeSlug={categorySlug} search={search} />
        </aside>
        <div className="min-w-0 flex-1">
          <ProductGrid products={products} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            hrefFor={(p) => {
              const params = new URLSearchParams()
              if (search) params.set('q', search)
              if (categorySlug) params.set('category', categorySlug)
              if (p > 1) params.set('page', String(p))
              return `/products${params.toString() ? `?${params}` : ''}`
            }}
          />
        </div>
      </div>
    </div>
  )
}
