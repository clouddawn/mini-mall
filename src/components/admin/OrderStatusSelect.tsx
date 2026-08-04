'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { updateOrderStatusAction } from '@/lib/actions/admin'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types'

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

interface OrderStatusSelectProps {
  orderId: number
  current: OrderStatus
}

export function OrderStatusSelect({ orderId, current }: OrderStatusSelectProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OrderStatus
    if (next === current) return
    if (!confirm(`将订单 #${orderId} 状态改为「${ORDER_STATUS_LABELS[next]}」？`)) {
      e.target.value = current
      return
    }
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, next)
      if ('error' in result) alert(result.error)
      router.refresh()
    })
  }

  return (
    <select
      value={current}
      onChange={onChange}
      disabled={pending}
      className="input-base !w-auto !py-1.5 !text-xs"
      aria-label="订单状态"
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  )
}
