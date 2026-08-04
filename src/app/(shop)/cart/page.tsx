import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartSummary } from '@/components/cart/CartSummary'

export const metadata: Metadata = { title: '购物车 · Mini Mall' }
export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const session = await getSession()

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  })

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 border-b border-line pb-6">
        <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Cart</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">购物车</h1>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-line py-24 text-center">
          <p className="font-display text-2xl text-ink-soft">购物车空空如也</p>
          <p className="mt-3 text-sm text-ink-faint">去挑几件心仪的好物吧</p>
          <Link href="/products" className="btn mt-8 bg-ink px-6 py-3 text-paper hover:bg-vermilion">
            去逛逛 →
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ul>
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </ul>
          </div>
          <aside className="lg:col-span-1">
            <CartSummary total={total} itemCount={itemCount} />
          </aside>
        </div>
      )}
    </div>
  )
}
