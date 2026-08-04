'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { payOrderAction, cancelOrderAction } from '@/lib/actions/order'
import type { OrderStatus } from '@/types'

interface OrderActionsProps {
  orderId: number
  status: OrderStatus
  /** 是否为管理端（管理端支付按钮跳过，走状态下拉） */
  admin?: boolean
}

export function PayButton({ orderId }: { orderId: number }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function pay() {
    startTransition(async () => {
      const result = await payOrderAction(orderId)
      if ('error' in result) alert(result.error)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={pay}
      disabled={pending}
      className="btn bg-vermilion px-6 py-3 text-white hover:bg-vermilion-dark"
    >
      {pending ? '处理中…' : '模拟支付 ¥'}
    </button>
  )
}

export function CancelButton({ orderId }: { orderId: number }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function cancel() {
    if (!confirm('确定取消该订单吗？已支付的订单将退款（模拟）')) return
    startTransition(async () => {
      const result = await cancelOrderAction(orderId)
      if ('error' in result) alert(result.error)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={pending}
      className="btn border border-ink/25 text-ink-soft hover:border-vermilion hover:text-vermilion"
    >
      取消订单
    </button>
  )
}

export function OrderActions({ orderId, status }: OrderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {status === 'PENDING' && (
        <>
          <PayButton orderId={orderId} />
          <CancelButton orderId={orderId} />
        </>
      )}
      {status === 'PAID' && <CancelButton orderId={orderId} />}
    </div>
  )
}
