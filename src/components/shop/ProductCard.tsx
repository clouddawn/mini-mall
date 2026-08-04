import Link from 'next/link'
import type { Product } from '@prisma/client'
import { formatPrice } from '@/types'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block border border-line bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-[0_12px_30px_rgba(28,26,23,0.08)]"
    >
      {/* 图片区域 */}
      <div className="relative aspect-square overflow-hidden bg-ink/5">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-4xl text-ink/15">{product.name.slice(0, 1)}</span>
          </div>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 bg-ink/85 px-2 py-0.5 text-[10px] tracking-widest text-paper uppercase">
            售罄
          </span>
        )}
      </div>

      {/* 信息区域 */}
      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-1 text-sm text-ink">{product.name}</h3>
        <div className="flex items-baseline justify-between">
          <span className="num text-lg font-medium text-vermilion">{formatPrice(product.price)}</span>
          <span className="text-[10px] text-ink-faint">库存 {product.stock}</span>
        </div>
      </div>
    </Link>
  )
}
