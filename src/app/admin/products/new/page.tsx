import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <div className="mb-8 border-b border-line pb-6">
        <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Products / New</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">新增商品</h1>
      </div>
      <ProductForm categories={categories} />
    </div>
  )
}
