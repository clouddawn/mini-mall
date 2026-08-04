import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Orders</p>
          <h1 className="font-display mt-1 text-3xl font-semibold">订单管理</h1>
          <p className="num mt-1 text-xs text-ink-faint">共 {orders.length} 笔订单</p>
        </div>
      </div>

      <div className="overflow-x-auto border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-faint">
              <th className="px-4 py-3 font-medium">订单号</th>
              <th className="px-4 py-3 font-medium">用户</th>
              <th className="px-4 py-3 font-medium">商品</th>
              <th className="px-4 py-3 font-medium">金额</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">时间</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-faint">
                  暂无订单
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-line/60 last:border-0 hover:bg-paper">
                  <td className="num px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="hover:text-vermilion">
                      #{String(o.id).padStart(6, '0')}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.user.name}</td>
                  <td className="num px-4 py-3 text-xs text-ink-faint">
                    {o.items.reduce((s, i) => s + i.quantity, 0)} 件
                  </td>
                  <td className="num px-4 py-3">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <Badge className={ORDER_STATUS_COLORS[o.status as OrderStatus]}>
                      {ORDER_STATUS_LABELS[o.status as OrderStatus]}
                    </Badge>
                  </td>
                  <td className="num px-4 py-3 text-xs text-ink-faint">
                    {o.createdAt.toLocaleString('zh-CN', { hour12: false })}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect orderId={o.id} current={o.status as OrderStatus} />
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
