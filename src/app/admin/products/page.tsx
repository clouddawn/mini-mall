import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/types'
import { Button } from '@/components/ui/Button'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Products</p>
          <h1 className="font-display mt-1 text-3xl font-semibold">商品管理</h1>
          <p className="num mt-1 text-xs text-ink-faint">共 {products.length} 件商品</p>
        </div>
        <Button href="/admin/products/new">＋ 新增商品</Button>
      </div>

      <div className="overflow-x-auto border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-faint">
              <th className="px-4 py-3 font-medium">商品</th>
              <th className="px-4 py-3 font-medium">分类</th>
              <th className="px-4 py-3 font-medium">价格</th>
              <th className="px-4 py-3 font-medium">库存</th>
              <th className="px-4 py-3 font-medium">标识</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink-faint">
                  还没有商品，点击右上角「新增商品」开始吧
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-line/60 last:border-0 hover:bg-paper">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-line bg-ink/5">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-display text-sm text-ink/20">{p.name.slice(0, 1)}</span>
                        )}
                      </span>
                      <span className="line-clamp-1 max-w-44 font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-soft">{p.category.name}</td>
                  <td className="num px-4 py-3">{formatPrice(p.price)}</td>
                  <td className={`num px-4 py-3 ${p.stock === 0 ? 'text-vermilion' : ''}`}>{p.stock}</td>
                  <td className="num px-4 py-3 text-xs text-ink-faint">{p.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-xs text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                      >
                        编辑
                      </Link>
                      <DeleteButton id={p.id} kind="product" confirmText={`确定删除商品「${p.name}」？`} />
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
