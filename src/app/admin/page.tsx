import { prisma } from '@/lib/prisma'
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

async function getStats() {
  const [productCount, categoryCount, userCount, orderCount, orders, pendingOrders, revenueAgg] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 6, include: { user: true, items: true } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { notIn: ['CANCELLED'] } } }),
  ])
  return { productCount, categoryCount, userCount, orderCount, pendingOrders, revenue: revenueAgg._sum.total ?? 0, orders }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: '商品总数', value: String(stats.productCount) },
    { label: '分类数', value: String(stats.categoryCount) },
    { label: '注册用户', value: String(stats.userCount) },
    { label: '订单总数', value: String(stats.orderCount) },
    { label: '待支付', value: String(stats.pendingOrders) },
    { label: '累计营收（非取消）', value: formatPrice(stats.revenue), accent: true },
  ]

  return (
    <div>
      <div className="mb-8 border-b border-line pb-6">
        <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Dashboard</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">仪表板</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="border border-line bg-card p-5">
            <p className="text-xs text-ink-faint">{c.label}</p>
            <p className={`num mt-2 text-2xl font-medium ${c.accent ? 'text-vermilion' : ''}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* 最近订单 */}
      <h2 className="font-display mt-10 mb-4 text-lg font-semibold">最近订单</h2>
      {stats.orders.length === 0 ? (
        <p className="border border-dashed border-line py-12 text-center text-sm text-ink-faint">暂无订单</p>
      ) : (
        <div className="overflow-x-auto border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-faint">
                <th className="px-4 py-3 font-medium">订单号</th>
                <th className="px-4 py-3 font-medium">用户</th>
                <th className="px-4 py-3 font-medium">件数</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {stats.orders.map((o) => (
                <tr key={o.id} className="border-b border-line/60 last:border-0 hover:bg-paper">
                  <td className="num px-4 py-3">#{String(o.id).padStart(6, '0')}</td>
                  <td className="px-4 py-3">{o.user.name}</td>
                  <td className="num px-4 py-3">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="num px-4 py-3">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <Badge className={ORDER_STATUS_COLORS[o.status as OrderStatus]}>
                      {ORDER_STATUS_LABELS[o.status as OrderStatus]}
                    </Badge>
                  </td>
                  <td className="num px-4 py-3 text-xs text-ink-faint">
                    {o.createdAt.toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
