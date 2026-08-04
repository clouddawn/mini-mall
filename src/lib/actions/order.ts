'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export type OrderActionResult = { error: string } | { success: true }

const shippingSchema = z.object({
  name: z.string().trim().min(1, '请填写收货人姓名').max(30),
  address: z.string().trim().min(5, '请填写完整收货地址').max(200),
  phone: z.string().trim().min(5, '请填写有效电话').max(20),
})

/** 库存不足（事务内抛出的业务错误，在 catch 中转成表单提示） */
class StockError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StockError'
  }
}

/** 下单：事务内创建订单 + 快照价格 + 扣库存 + 清空购物车 */
export async function placeOrderAction(prev: OrderActionResult | null, formData: FormData): Promise<OrderActionResult> {
  const session = await getSession()

  const parsed = shippingSchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address'),
    phone: formData.get('phone'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? '请检查收货信息' }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
  })
  if (cartItems.length === 0) return { error: '购物车是空的' }

  const total = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  let orderId: number
  try {
    orderId = await prisma.$transaction(async (tx) => {
      // 事务内校验并扣减库存（条件更新，并发下单也不会超卖）
      for (const i of cartItems) {
        const updated = await tx.product.updateMany({
          where: { id: i.productId, stock: { gte: i.quantity } },
          data: { stock: { decrement: i.quantity } },
        })
        if (updated.count === 0) {
          const product = await tx.product.findUnique({ where: { id: i.productId } })
          throw new StockError(`「${i.product.name}」库存不足，仅剩 ${product?.stock ?? 0} 件`)
        }
      }

      const created = await tx.order.create({
        data: {
          userId: session.userId,
          total,
          shippingName: parsed.data.name,
          shippingAddress: parsed.data.address,
          shippingPhone: parsed.data.phone,
          items: {
            create: cartItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.product.price, // 价格快照
            })),
          },
        },
      })

      // 清空购物车
      await tx.cartItem.deleteMany({ where: { userId: session.userId } })

      return created.id
    })
  } catch (e) {
    if (e instanceof StockError) return { error: e.message }
    throw e
  }

  revalidatePath('/cart')
  revalidatePath('/products')
  redirect(`/orders/${orderId}`)
}

/** 模拟支付：PENDING → PAID */
export async function payOrderAction(orderId: number): Promise<OrderActionResult> {
  const session = await getSession()

  const order = await prisma.order.findFirst({ where: { id: orderId, userId: session.userId } })
  if (!order) return { error: '订单不存在' }
  if (order.status !== 'PENDING') return { error: '当前状态不可支付' }

  await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } })
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/admin/orders')
  return { success: true }
}

/** 取消订单：PENDING/PAID → CANCELLED（归还库存） */
export async function cancelOrderAction(orderId: number): Promise<OrderActionResult> {
  const session = await getSession()

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.userId },
    include: { items: true },
  })
  if (!order) return { error: '订单不存在' }
  if (order.status !== 'PENDING' && order.status !== 'PAID') {
    return { error: '已发货或已完成的订单不能取消' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } })
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }, // 归还库存
      })
    }
  })

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/admin/orders')
  return { success: true }
}
