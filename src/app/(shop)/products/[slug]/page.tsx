import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/types'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

interface ProductDetailProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductDetailProps): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug }, include: { category: true } })
  return { title: product ? `${product.name} · Mini Mall` : '商品 · Mini Mall' }
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug }, include: { category: true } })
  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="mb-4 text-[10px] tracking-[0.3em] text-ink-faint uppercase">
        <Link href="/products" className="hover:text-ink">
          全部商品
        </Link>
        {' / '}
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-ink">
          {product.category.name}
        </Link>
      </p>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* 商品图 */}
        <div className="relative aspect-square overflow-hidden border border-line bg-ink/5 lg:col-span-3">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-8xl text-ink/10">{product.name.slice(0, 1)}</span>
            </div>
          )}
          {product.stock === 0 && (
            <span className="absolute top-4 left-4 bg-ink/85 px-3 py-1 text-xs tracking-widest text-paper uppercase">
              售罄
            </span>
          )}
        </div>

        {/* 商品信息 */}
        <div className="flex flex-col lg:col-span-2">
          <p className="text-xs tracking-[0.25em] text-vermilion uppercase">{product.category.name}</p>
          <h1 className="font-display mt-2 text-3xl font-semibold">{product.name}</h1>

          <div className="hairline my-6" />

          <div className="flex items-baseline gap-3">
            <span className="num text-4xl font-medium text-vermilion">{formatPrice(product.price)}</span>
            <span className="text-sm text-ink-faint">库存 {product.stock} 件</span>
          </div>

          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-ink-soft">{product.description ?? '暂无描述'}</p>

          <div className="mt-8">
            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>

          <ul className="mt-8 space-y-2 border-t border-line pt-6 text-xs text-ink-faint">
            <li className="flex gap-2">
              <span className="w-20 shrink-0 tracking-widest">编号</span>
              <span className="num text-ink-soft">MM-{String(product.id).padStart(4, '0')}</span>
            </li>
            <li className="flex gap-2">
              <span className="w-20 shrink-0 tracking-widest">支付</span>
              <span className="text-ink-soft">模拟支付，不会产生真实扣款</span>
            </li>
            <li className="flex gap-2">
              <span className="w-20 shrink-0 tracking-widest">退换</span>
              <span className="text-ink-soft">虚拟练习项目，不支持真实退换</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 相关推荐 */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-baseline justify-between border-b border-line pb-3">
            <h2 className="font-display text-xl font-semibold">同类推荐</h2>
            <Link href={`/products?category=${product.category.slug}`} className="text-xs text-ink-soft hover:text-ink">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="group block">
                <div className="aspect-square overflow-hidden border border-line bg-ink/5">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-3xl text-ink/10">{p.name.slice(0, 1)}</span>
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-1 text-sm">{p.name}</p>
                <p className="num text-sm text-vermilion">{formatPrice(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
