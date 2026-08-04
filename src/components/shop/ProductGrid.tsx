import type { Product } from '@prisma/client'
import { ProductCard } from '@/components/shop/ProductCard'

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="border border-dashed border-line py-20 text-center">
        <p className="font-display text-xl text-ink-soft">没有找到商品</p>
        <p className="mt-2 text-sm text-ink-faint">试试更换关键词或分类</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
