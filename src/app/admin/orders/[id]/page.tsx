import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect'

export const metadata: Metadata = { title: '订单详情 · 管理后台' }
export const dynamic = 'force-dynamic'

interface AdminOrderDetailProps {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailProps) {
  const { id } = await params
  // 非数字 id 直接 404，避免 NaN 传入 Prisma 触发校验异常
  const orderId = Number(id)
  if (!Number.isInteger(orderId)) notFound()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, items: { include: { product: true } } },
  })
  if (!order) notFound()

  const status = order.status as OrderStatus

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Order Detail</p>
          <h1 className="font-display mt-1 text-3xl font-semibold">订单 #{String(order.id).padStart(6, '0')}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={ORDER_STATUS_COLORS[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
          <OrderStatusSelect orderId={order.id} current={status} />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 商品清单 */}
        <div className="border border-line bg-card">
          <p className="border-b border-line px-5 py-3 text-xs tracking-[0.25em] text-ink-faint uppercase">商品清单</p>
          <ul>
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 border-b border-line/60 px-5 py-3 text-sm last:border-0">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate">{item.product.name}</span>
                  <span className="num shrink-0 text-xs text-ink-faint">× {item.quantity}</span>
                </span>
                <span className="num shrink-0 text-xs text-ink-soft">
                  {formatPrice(item.price)} / 小计 {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 用户与收货信息 */}
        <div className="space-y-6">
          <div className="border border-line bg-card p-5">
            <p className="mb-3 text-xs tracking-[0.25em] text-ink-faint uppercase">用户信息</p>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-faint">用户</dt>
                <dd>{order.user.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-faint">邮箱</dt>
                <dd className="truncate">{order.user.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-faint">收货人</dt>
                <dd>{order.shippingName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-faint">电话</dt>
                <dd className="num">{order.shippingPhone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-faint">地址</dt>
                <dd className="text-right">{order.shippingAddress}</dd>
              </div>
            </dl>
          </div>

          <div className="border border-line bg-card p-5">
            <p className="mb-3 text-xs tracking-[0.25em] text-ink-faint uppercase">金额信息</p>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">订单金额</dt>
                <dd className="num">{formatPrice(order.total)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">下单时间</dt>
                <dd className="num">{order.createdAt.toLocaleString('zh-CN', { hour12: false })}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">更新时间</dt>
                <dd className="num">{order.updatedAt.toLocaleString('zh-CN', { hour12: false })}</dd>
              </div>
            </dl>
          </div>

          <Link
            href="/admin/orders"
            className="block text-center text-xs text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          >
            ← 返回订单列表
          </Link>
        </div>
      </div>
    </div>
  )
}
