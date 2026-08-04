'use client'

import { useActionState } from 'react'
import { placeOrderAction } from '@/lib/actions/order'
import { Input } from '@/components/ui/Input'

export function ShippingForm() {
  const [state, formAction, pending] = useActionState(placeOrderAction, null)

  return (
    <form action={formAction} className="space-y-5">
      {state && 'error' in state && (
        <p className="border border-vermilion/30 bg-vermilion-light px-3 py-2 text-sm text-vermilion">{state.error}</p>
      )}
      <Input name="name" label="收货人" placeholder="姓名" required autoComplete="name" />
      <Input name="phone" label="联系电话" placeholder="手机号码" required autoComplete="tel" />
      <Input name="address" label="收货地址" placeholder="省 / 市 / 区 · 详细地址" required autoComplete="street-address" />
      <button
        type="submit"
        disabled={pending}
        className="btn w-full bg-vermilion py-3 text-white hover:bg-vermilion-dark"
      >
        {pending ? '提交订单中…' : '提交订单'}
      </button>
    </form>
  )
}
