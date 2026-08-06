'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { getMembershipLevel } from '@/lib/membership'
import type { OrderStatus } from '@/types'

export type AdminActionResult = { error: string } | { success: true }

// ── 商品 ──────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().trim().min(1, '请输入商品名称').max(100),
  slug: z
    .string()
    .trim()
    .min(1, '请输入商品标识')
    .regex(/^[a-z0-9-]+$/, '仅支持小写字母、数字和连字符'),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  price: z.coerce.number().int('价格必须为整数').min(1, '价格至少 1 分').max(99999999),
  stock: z.coerce.number().int('库存必须为整数').min(0, '库存不能为负').max(99999),
  categoryId: z.coerce.number().int('请选择分类'),
  image: z.string().trim().url('请输入有效的图片 URL').optional().or(z.literal('')),
})

type Parsed<T> = { data: T } | { error: string }

function parseProduct(formData: FormData): Parsed<z.infer<typeof productSchema>> {
  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') ?? '',
    price: formData.get('price'),
    stock: formData.get('stock'),
    categoryId: formData.get('categoryId'),
    image: formData.get('image') ?? '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? '输入有误' }
  return { data: parsed.data }
}

function toProductData(d: z.infer<typeof productSchema>) {
  return {
    name: d.name,
    slug: d.slug,
    description: d.description || null,
    price: d.price,
    stock: d.stock,
    categoryId: d.categoryId,
    image: d.image || null,
  }
}

export async function createProductAction(
  _prev: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = parseProduct(formData)
  if ('error' in parsed) return parsed

  const exists = await prisma.product.findUnique({ where: { slug: parsed.data.slug } })
  if (exists) return { error: '商品标识已被占用' }

  await prisma.product.create({ data: toProductData(parsed.data) })
  revalidatePath('/admin/products')
  revalidatePath('/products')
  return { success: true }
}

export async function updateProductAction(
  _prev: AdminActionResult | null,
  id: number,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = parseProduct(formData)
  if ('error' in parsed) return parsed

  const exists = await prisma.product.findFirst({ where: { slug: parsed.data.slug, id: { not: id } } })
  if (exists) return { error: '商品标识已被占用' }

  await prisma.product.update({ where: { id }, data: toProductData(parsed.data) })
  revalidatePath('/admin/products')
  revalidatePath(`/products/${parsed.data.slug}`)
  revalidatePath('/products')
  return { success: true }
}

export async function deleteProductAction(id: number): Promise<AdminActionResult> {
  await requireAdmin()
  try {
    await prisma.product.delete({ where: { id } })
  } catch (e) {
    // 商品存在订单记录时外键 RESTRICT 会拒绝删除（P2003）
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return { error: '该商品已有订单记录，无法删除' }
    }
    throw e
  }
  revalidatePath('/admin/products')
  revalidatePath('/products')
  return { success: true }
}

// ── 分类 ──────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().trim().min(1, '请输入分类名称').max(50),
  slug: z
    .string()
    .trim()
    .min(1, '请输入分类标识')
    .regex(/^[a-z0-9-]+$/, '仅支持小写字母、数字和连字符'),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  image: z.string().trim().url('请输入有效的图片 URL').optional().or(z.literal('')),
})

function parseCategory(formData: FormData): Parsed<z.infer<typeof categorySchema>> {
  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') ?? '',
    image: formData.get('image') ?? '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? '输入有误' }
  return { data: parsed.data }
}

export async function createCategoryAction(
  _prev: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = parseCategory(formData)
  if ('error' in parsed) return parsed

  const { name, slug, description, image } = parsed.data
  const exists = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } })
  if (exists) return { error: '分类名称或标识已存在' }

  await prisma.category.create({ data: { name, slug, description: description || null, image: image || null } })
  revalidatePath('/admin/categories')
  revalidatePath('/products')
  return { success: true }
}

export async function updateCategoryAction(
  _prev: AdminActionResult | null,
  id: number,
  formData: FormData,
): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = parseCategory(formData)
  if ('error' in parsed) return parsed

  const { name, slug, description, image } = parsed.data
  const exists = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }], NOT: { id } } })
  if (exists) return { error: '分类名称或标识已存在' }

  await prisma.category.update({
    where: { id },
    data: { name, slug, description: description || null, image: image || null },
  })
  revalidatePath('/admin/categories')
  revalidatePath('/products')
  return { success: true }
}

export async function deleteCategoryAction(id: number): Promise<AdminActionResult> {
  await requireAdmin()

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  })
  if (!category) return { error: '分类不存在' }
  if (category._count.products > 0) {
    return { error: `该分类下还有 ${category._count.products} 件商品，无法删除` }
  }

  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
  revalidatePath('/products')
  return { success: true }
}

// ── 用户 ──────────────────────────────────────────────

const userUpdateSchema = z.object({
  name: z.string().trim().min(1, '请输入昵称').max(30, '昵称最长 30 字'),
  role: z.enum(['USER', 'ADMIN']),
})

/** 管理端修改用户昵称与角色（会员等级由累计消费自动计算，不开放手动改） */
export async function updateUserAction(
  _prev: AdminActionResult | null,
  userId: number,
  formData: FormData,
): Promise<AdminActionResult> {
  const session = await requireAdmin()
  const parsed = userUpdateSchema.safeParse({
    name: formData.get('name'),
    role: formData.get('role'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? '输入有误' }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: '用户不存在' }

  // 不能把自己降级为 USER，防止管理员失去后台访问权限
  if (userId === session.userId && parsed.data.role !== 'ADMIN') {
    return { error: '不能修改自己的角色' }
  }

  // name 加了 @unique，修改昵称需检查是否已被其他用户占用
  if (parsed.data.name !== user.name) {
    const nameExists = await prisma.user.findUnique({ where: { name: parsed.data.name } })
    if (nameExists) return { error: '该昵称已被其他用户使用' }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name: parsed.data.name, role: parsed.data.role },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: '该昵称已被其他用户使用' }
    }
    throw e
  }
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

/** 管理端删除用户；有关联订单或购物车的用户不允许删除 */
export async function deleteUserAction(userId: number): Promise<AdminActionResult> {
  const session = await requireAdmin()
  if (userId === session.userId) return { error: '不能删除自己的账号' }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { orders: true, cartItems: true } } },
  })
  if (!user) return { error: '用户不存在' }
  if (user._count.orders > 0 || user._count.cartItems > 0) {
    return {
      error: `该用户有 ${user._count.orders} 笔订单、${user._count.cartItems} 件购物车商品，无法删除`,
    }
  }

  try {
    await prisma.user.delete({ where: { id: userId } })
  } catch (e) {
    // 竞态下仍有外键约束兜底
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return { error: '该用户存在关联数据，无法删除' }
    }
    throw e
  }
  revalidatePath('/admin/users')
  return { success: true }
}

// ── 订单状态 ──────────────────────────────────────────

const statusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const satisfies OrderStatus[]),
})

/** 管理端修改订单状态；取消/恢复取消时自动增减库存 */
export async function updateOrderStatusAction(orderId: number, status: string): Promise<AdminActionResult> {
  await requireAdmin()
  const parsed = statusSchema.safeParse({ status })
  if (!parsed.success) return { error: '无效的状态' }

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
  if (!order) return { error: '订单不存在' }

  const newStatus = parsed.data.status
  const oldStatus = order.status as OrderStatus

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: newStatus } })
    for (const item of order.items) {
      const cancelled = (s: OrderStatus) => s === 'CANCELLED'
      if (cancelled(newStatus) && !cancelled(oldStatus)) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
      } else if (!cancelled(newStatus) && cancelled(oldStatus)) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
      }
    }

    // 累计消费与等级同步：变更为已支付则累加；已支付被取消则回退（可能降级）
    const user = await tx.user.findUnique({ where: { id: order.userId } })
    if (!user) return
    let newTotalSpent = user.totalSpent
    if (newStatus === 'PAID' && oldStatus !== 'PAID') {
      newTotalSpent += order.total
    } else if (newStatus === 'CANCELLED' && oldStatus === 'PAID') {
      newTotalSpent = Math.max(0, newTotalSpent - order.total)
    }
    if (newTotalSpent !== user.totalSpent) {
      const newLevel = getMembershipLevel(newTotalSpent)
      await tx.user.update({
        where: { id: order.userId },
        data: { totalSpent: newTotalSpent, membershipLevel: newLevel },
      })
    }
  })

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/profile')
  return { success: true }
}
