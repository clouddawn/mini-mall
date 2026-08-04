import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

interface EditProductProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductProps) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: Number.parseInt(id, 10) } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!product) notFound()

  return (
    <div>
      <div className="mb-8 border-b border-line pb-6">
        <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Products / Edit</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">编辑商品</h1>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
