import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { formatPrice } from '@/types'
import { calcCartTotal, applyDiscount, getTier, discountLabel } from '@/lib/membership'
import { ShippingForm } from '@/components/checkout/ShippingForm'

export const metadata: Metadata = { title: '结算 · Mini Mall' }
export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const session = await getSession()

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  })
  if (items.length === 0) redirect('/cart')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const originalTotal = calcCartTotal(items)
  const { discountedTotal, discountAmount } = applyDiscount(originalTotal, user?.membershipLevel ?? 0)
  const tier = getTier(user?.membershipLevel ?? 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 border-b border-line pb-6">
        <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Checkout</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">结算</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* 收货信息 */}
        <div className="lg:col-span-2">
          <h2 className="font-display mb-4 text-lg font-semibold">收货信息</h2>
          <ShippingForm />

          <h2 className="font-display mt-10 mb-4 text-lg font-semibold">商品清单</h2>
          <ul className="border-t border-line">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-4 border-b border-line py-3 text-sm">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="truncate">{i.product.name}</span>
                  <span className="num shrink-0 text-xs text-ink-faint">× {i.quantity}</span>
                </span>
                <span className="num shrink-0">{formatPrice(i.product.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 订单摘要 */}
        <aside>
          <div className="border border-line bg-card p-6">
            <p className="mb-4 text-[10px] tracking-[0.3em] text-ink-faint uppercase">订单摘要</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between text-ink-soft">
                <dt>商品件数</dt>
                <dd className="num">{itemCount} 件</dd>
              </div>
              {discountAmount > 0 && (
                <>
                  <div className="flex justify-between text-ink-soft">
                    <dt>商品原价</dt>
                    <dd className="num line-through">{formatPrice(originalTotal)}</dd>
                  </div>
                  <div className="flex justify-between text-vermilion">
                    <dt>{tier.name}会员 · {discountLabel(tier.rate)}</dt>
                    <dd className="num">-{formatPrice(discountAmount)}</dd>
                  </div>
                </>
              )}
              <div className="hairline !my-4" />
              <div className="flex items-baseline justify-between">
                <dt>应付合计</dt>
                <dd className="num text-2xl font-medium text-vermilion">{formatPrice(discountedTotal)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-[10px] leading-4 text-ink-faint">
              提交订单即视为同意模拟支付流程；支付按钮将在订单详情中出现。
            </p>
            <Link href="/cart" className="mt-4 block text-center text-xs text-ink-soft underline-offset-4 hover:text-ink hover:underline">
              ← 返回购物车
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
