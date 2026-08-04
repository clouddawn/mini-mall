'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { updateCartQuantity, removeFromCart } from '@/lib/actions/cart'
import { formatPrice } from '@/types'

interface CartItemRowProps {
  item: {
    id: number
    quantity: number
    product: {
      id: number
      name: string
      slug: string
      price: number
      image: string | null
      stock: number
    }
  }
}

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function changeQuantity(q: number) {
    if (q < 1) return
    startTransition(async () => {
      const result = await updateCartQuantity(item.id, q)
      if ('error' in result) alert(result.error)
      router.refresh()
    })
  }

  function remove() {
    startTransition(async () => {
      const result = await removeFromCart(item.id)
      if ('error' in result) alert(result.error)
      router.refresh()
    })
  }

  const { product } = item

  return (
    <li className="flex gap-4 border-b border-line py-5 sm:gap-6">
      {/* 缩略图 */}
      <Link href={`/products/${product.slug}`} className="block h-20 w-20 shrink-0 overflow-hidden border border-line bg-ink/5 sm:h-24 sm:w-24">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-2xl text-ink/10">{product.name.slice(0, 1)}</span>
          </div>
        )}
      </Link>

      {/* 信息 */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href={`/products/${product.slug}`} className="block truncate text-sm hover:text-vermilion">
              {product.name}
            </Link>
            <p className="num mt-0.5 text-xs text-ink-faint">单价 {formatPrice(product.price)}</p>
          </div>
          <span className="num shrink-0 text-base font-medium">{formatPrice(product.price * item.quantity)}</span>
        </div>

        <div className="flex items-center justify-between">
          {/* 数量控制 */}
          <div className="flex items-center border border-ink/20" aria-label={`${product.name} 数量`}>
            <button
              type="button"
              onClick={() => changeQuantity(item.quantity - 1)}
              disabled={pending || item.quantity <= 1}
              className="px-2.5 py-1 text-sm text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30"
              aria-label="减少数量"
            >
              −
            </button>
            <span className="num w-8 text-center text-sm">{item.quantity}</span>
            <button
              type="button"
              onClick={() => changeQuantity(item.quantity + 1)}
              disabled={pending || item.quantity >= product.stock}
              className="px-2.5 py-1 text-sm text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30"
              aria-label="增加数量"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-xs text-ink-faint underline-offset-4 transition-colors hover:text-vermilion hover:underline"
          >
            移除
          </button>
        </div>
      </div>
    </li>
  )
}
