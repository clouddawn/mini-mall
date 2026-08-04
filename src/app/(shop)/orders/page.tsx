import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'

export const metadata: Metadata = { title: '我的订单 · Mini Mall' }
export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const session = await getSession()

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 border-b border-line pb-6">
        <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Orders</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">我的订单</h1>
      </div>

      {orders.length === 0 ? (
        <div className="border border-dashed border-line py-24 text-center">
          <p className="font-display text-2xl text-ink-soft">还没有订单</p>
          <p className="mt-3 text-sm text-ink-faint">完成第一笔模拟购物吧</p>
          <Link href="/products" className="btn mt-8 bg-ink px-6 py-3 text-paper hover:bg-vermilion">
            去逛逛 →
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="border border-line bg-card">
              {/* 订单头 */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
                <div className="flex items-center gap-4">
                  <Link href={`/orders/${order.id}`} className="num text-sm font-medium hover:text-vermilion">
                    订单 #{String(order.id).padStart(6, '0')}
                  </Link>
                  <span className="text-xs text-ink-faint">
                    {order.createdAt.toLocaleDateString('zh-CN')} {order.createdAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <Badge className={ORDER_STATUS_COLORS[order.status as OrderStatus]}>
                  {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                </Badge>
              </div>

              {/* 商品摘要 */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-ink/5"
                    >
                      {item.product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-display text-base text-ink/20">{item.product.name.slice(0, 1)}</span>
                      )}
                    </span>
                  ))}
                </div>
                <p className="min-w-0 flex-1 truncate text-sm text-ink-soft">
                  {order.items.map((i) => i.product.name).join('、')}
                </p>
                <span className="num shrink-0 text-base font-medium">{formatPrice(order.total)}</span>
                <Link
                  href={`/orders/${order.id}`}
                  className="btn shrink-0 border border-ink/25 px-3 py-1.5 text-xs hover:border-ink hover:bg-ink hover:text-paper"
                >
                  详情
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
