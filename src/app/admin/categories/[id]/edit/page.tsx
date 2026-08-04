import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CategoryForm } from '@/components/admin/CategoryForm'

export const dynamic = 'force-dynamic'

interface EditCategoryProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryProps) {
  const { id } = await params
  const category = await prisma.category.findUnique({ where: { id: Number.parseInt(id, 10) } })
  if (!category) notFound()

  return (
    <div>
      <div className="mb-8 border-b border-line pb-6">
        <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Categories / Edit</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">编辑分类</h1>
      </div>
      <CategoryForm category={category} />
    </div>
  )
}
