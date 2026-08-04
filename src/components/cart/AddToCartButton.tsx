'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addToCart } from '@/lib/actions/cart'

interface AddToCartButtonProps {
  productId: number
  stock: number
  quantity?: number
}

export function AddToCartButton({ productId, stock, quantity = 1 }: AddToCartButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const soldOut = stock <= 0

  function handleClick() {
    startTransition(async () => {
      const result = await addToCart(productId, quantity)
      if ('success' in result) {
        router.refresh() // 刷新 Header 中的购物车数量
      } else if (result.redirect) {
        router.push('/login')
      }
    })
  }

  if (soldOut) {
    return (
      <button disabled className="btn w-full cursor-not-allowed bg-ink/10 text-ink-faint">
        暂时售罄
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="btn w-full bg-vermilion text-white hover:bg-vermilion-dark"
    >
      {pending ? '加入中…' : '加入购物车'}
    </button>
  )
}
