'use server'

import { revalidatePath } from 'next/cache'
import { getSession, getSessionSafe } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type CartActionResult = { success: true } | { error: string; redirect?: boolean }

export async function addToCart(productId: number, quantity: number = 1): Promise<CartActionResult> {
  const session = await getSessionSafe()
  if (!session) return { error: '请先登录', redirect: true }

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return { error: '商品不存在' }

  // 检查现有购物车数量 + 库存上限
  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: session.userId, productId } },
  })
  const currentQty = existing?.quantity ?? 0
  if (product.stock <= 0 || currentQty + quantity > product.stock) {
    return {
      error:
        product.stock <= 0
          ? '商品已售罄'
          : `库存不足，最多还可购买 ${product.stock - currentQty} 件`,
    }
  }

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: session.userId, productId } },
    create: { userId: session.userId, productId, quantity },
    update: { quantity: { increment: quantity } },
  })

  revalidatePath('/cart')
  return { success: true }
}

export async function updateCartQuantity(itemId: number, quantity: number): Promise<CartActionResult> {
  const session = await getSession()
  if (quantity < 1) return { error: '数量无效' }

  const item = await prisma.cartItem.findFirst({ where: { id: itemId, userId: session.userId } })
  if (!item) return { error: '条目不存在' }

  const product = await prisma.product.findUnique({ where: { id: item.productId } })
  if (product && quantity > product.stock) {
    return { error: `库存不足，仅剩 ${product.stock} 件` }
  }

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } })
  revalidatePath('/cart')
  return { success: true }
}

export async function removeFromCart(itemId: number): Promise<CartActionResult> {
  const session = await getSession()
  await prisma.cartItem.deleteMany({ where: { id: itemId, userId: session.userId } })
  revalidatePath('/cart')
  return { success: true }
}
