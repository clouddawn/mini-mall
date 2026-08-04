import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/types'

interface CartSummaryProps {
  total: number
  itemCount: number
}

export function CartSummary({ total, itemCount }: CartSummaryProps) {
  return (
    <div className="border border-line bg-card p-6">
      <p className="mb-4 text-[10px] tracking-[0.3em] text-ink-faint uppercase">订单摘要</p>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between text-ink-soft">
          <dt>商品件数</dt>
          <dd className="num">{itemCount} 件</dd>
        </div>
        <div className="hairline !my-4" />
        <div className="flex items-baseline justify-between">
          <dt className="text-sm">合计</dt>
          <dd className="num text-2xl font-medium text-vermilion">{formatPrice(total)}</dd>
        </div>
      </dl>
      <Button href="/checkout" size="lg" className="mt-6 w-full">
        去结算 →
      </Button>
      <p className="mt-3 text-center text-[10px] text-ink-faint">模拟支付，不产生真实扣款</p>
    </div>
  )
}
