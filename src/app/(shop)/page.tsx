import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/shop/ProductGrid'

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.category.findMany({
      take: 4,
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    }),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero 区 */}
      <section className="border-b border-line py-16 sm:py-24">
        <div className="grid items-end gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="mb-4 text-xs tracking-[0.4em] text-vermilion uppercase">Mini Mall · 微型精品商城</p>
            <h1 className="font-display text-5xl leading-tight font-semibold sm:text-6xl">
              小而美，
              <br />
              值得细看。
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-ink-soft">
              一家练习用微型商城：精选分类、克制选品、完整购物流程。
              所有支付均为模拟，放心体验从浏览到收货的全过程。
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/products" className="btn bg-vermilion px-6 py-3 text-white hover:bg-vermilion-dark">
                开始逛逛
              </Link>
              <Link href="/register" className="btn border border-ink/30 px-6 py-3 hover:border-ink hover:bg-ink hover:text-paper">
                注册账号
              </Link>
              <Link href="/admin" className="btn border border-ink/30 px-6 py-3 hover:border-ink hover:bg-ink hover:text-paper">
                管理后台
              </Link>
            </div>
          </div>

          {/* 分类索引（编辑风编号列表） */}
          <div className="lg:col-span-2">
            <p className="mb-3 text-[10px] tracking-[0.3em] text-ink-faint uppercase">索引 Index</p>
            <div className="hairline" />
            {categories.map((c, i) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="group flex items-baseline gap-4 border-b border-line py-3 transition-colors hover:bg-ink/2"
              >
                <span className="num text-xs text-ink-faint">0{i + 1}</span>
                <span className="font-display text-lg group-hover:text-vermilion">{c.name}</span>
                <span className="num ml-auto text-xs text-ink-faint">{c._count.products} 件</span>
              </Link>
            ))}
            {categories.length === 0 && (
              <p className="border-b border-line py-3 text-sm text-ink-faint">分类筹备中，先看看全部商品</p>
            )}
          </div>
        </div>
      </section>

      {/* 新品推荐 */}
      <section className="py-14">
        <div className="mb-6 flex items-baseline justify-between border-b border-line pb-3">
          <h2 className="font-display text-2xl font-semibold">新品上架</h2>
          <Link href="/products" className="text-xs text-ink-soft transition-colors hover:text-ink">
            查看全部 →
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  )
}
