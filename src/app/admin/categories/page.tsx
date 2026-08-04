import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/Button'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Categories</p>
          <h1 className="font-display mt-1 text-3xl font-semibold">分类管理</h1>
          <p className="num mt-1 text-xs text-ink-faint">共 {categories.length} 个分类</p>
        </div>
        <Button href="/admin/categories/new">＋ 新增分类</Button>
      </div>

      <div className="overflow-x-auto border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-faint">
              <th className="px-4 py-3 font-medium">分类</th>
              <th className="px-4 py-3 font-medium">标识</th>
              <th className="px-4 py-3 font-medium">描述</th>
              <th className="px-4 py-3 font-medium">商品数</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-ink-faint">
                  还没有分类，点击右上角「新增分类」开始吧
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-b border-line/60 last:border-0 hover:bg-paper">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="num px-4 py-3 text-xs text-ink-faint">{c.slug}</td>
                  <td className="line-clamp-1 max-w-56 px-4 py-3 text-xs text-ink-soft">{c.description ?? '—'}</td>
                  <td className="num px-4 py-3">{c._count.products}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/categories/${c.id}/edit`}
                        className="text-xs text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                      >
                        编辑
                      </Link>
                      <DeleteButton
                        id={c.id}
                        kind="category"
                        confirmText={`确定删除分类「${c.name}」？（分类下不能有商品）`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
