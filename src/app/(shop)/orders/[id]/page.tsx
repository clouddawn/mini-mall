import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { OrderActions } from '@/components/orders/OrderActions'

export const metadata: Metadata = { title: '订单详情 · Mini Mall' }
export const dynamic = 'force-dynamic'

interface OrderDetailProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailProps) {
  const { id } = await params
  const session = await getSession()

  // 非数字 id 直接 404，避免 NaN 传入 Prisma 触发校验异常
  const orderId = Number(id)
  if (!Number.isInteger(orderId)) notFound()

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.userId },
    include: {
      items: { include: { product: true } },
    },
  })
  if (!order) notFound()

  const status = order.status as OrderStatus
  const steps: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED']
  const currentStep = steps.indexOf(status)
  const cancelled = status === 'CANCELLED'

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* 页头 */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Order Detail</p>
          <h1 className="font-display mt-1 text-3xl font-semibold">订单 #{String(order.id).padStart(6, '0')}</h1>
        </div>
        <Badge className={ORDER_STATUS_COLORS[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
      </div>

      {/* 订单进度 */}
      {!cancelled ? (
        <div className="mb-8 border border-line bg-card px-6 py-5">
          <div className="flex items-center">
            {steps.map((step, i) => (
              <div key={step} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={`num flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                      i <= currentStep ? 'bg-vermilion text-white' : 'bg-ink/10 text-ink-faint'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-[10px] whitespace-nowrap ${i <= currentStep ? 'text-ink' : 'text-ink-faint'}`}>
                    {ORDER_STATUS_LABELS[step]}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`mx-2 mb-5 h-px flex-1 ${i < currentStep ? 'bg-vermilion' : 'bg-line'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mb-8 border border-vermilion/20 bg-vermilion-light/60 px-4 py-3 text-sm text-vermilion">
          该订单已取消，库存已归还。
        </p>
      )}

      {/* 操作区 */}
      {(status === 'PENDING' || status === 'PAID') && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border border-line bg-card p-5">
          <div>
            <p className="text-sm text-ink-soft">待处理订单</p>
            <p className="num mt-0.5 text-2xl font-medium text-vermilion">{formatPrice(order.total)}</p>
          </div>
          <OrderActions orderId={order.id} status={status} />
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-5">
        {/* 商品清单 */}
        <div className="md:col-span-3">
          <h2 className="font-display mb-3 text-lg font-semibold">商品清单</h2>
          <ul className="border-t border-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 border-b border-line py-4">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="block h-14 w-14 shrink-0 overflow-hidden border border-line bg-ink/5"
                >
                  {item.product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-display text-lg text-ink/15">
                      {item.product.name.slice(0, 1)}
                    </span>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/products/${item.product.slug}`} className="block truncate text-sm hover:text-vermilion">
                      {item.product.name}
                    </Link>
                    <p className="num mt-0.5 text-xs text-ink-faint">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="num shrink-0 text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 收货与金额 */}
        <div className="md:col-span-2">
          <h2 className="font-display mb-3 text-lg font-semibold">订单信息</h2>
          <div className="border border-line bg-card p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-faint">下单时间</dt>
                <dd className="num text-right">
                  {order.createdAt.toLocaleString('zh-CN', { hour12: false })}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-faint">收货人</dt>
                <dd className="text-right">{order.shippingName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-faint">联系电话</dt>
                <dd className="num text-right">{order.shippingPhone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-ink-faint">收货地址</dt>
                <dd className="text-right">{order.shippingAddress}</dd>
              </div>
            </dl>
            <div className="hairline my-4" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm">订单金额</span>
              <span className="num text-2xl font-medium text-vermilion">{formatPrice(order.total)}</span>
            </div>
          </div>
          <Link href="/orders" className="mt-4 block text-center text-xs text-ink-soft underline-offset-4 hover:text-ink hover:underline">
            ← 返回订单列表
          </Link>
        </div>
      </div>
    </div>
  )
}
