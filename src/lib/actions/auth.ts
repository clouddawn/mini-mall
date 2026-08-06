'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSession, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie } from '@/lib/auth'

export type AuthState = { error?: string; success?: boolean } | null

const loginSchema = z.object({
  login: z.string().trim().min(1, '请输入邮箱或昵称').max(100),
  password: z.string().min(6, '密码至少 6 位'),
})

const registerSchema = z.object({
  name: z.string().trim().min(1, '请输入昵称').max(30, '昵称最长 30 字'),
  email: z.string().trim().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少 6 位'),
})

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    login: formData.get('login'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '输入有误' }
  }

  // 支持邮箱或昵称登录（name 已加 @unique）
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: parsed.data.login }, { name: parsed.data.login }] },
  })
  if (!user || !(await verifyPassword(parsed.data.password, user.password))) {
    return { error: '邮箱/昵称或密码不正确' }
  }

  await setSessionCookie({ userId: user.id, role: user.role as 'USER' | 'ADMIN' })

  const redirectTo = formData.get('redirect')?.toString()
  // 仅允许站内路径；排除 // 前缀，防止协议相对 URL 造成的开放重定向
  redirect(redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/')
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '输入有误' }
  }

  // 邮箱与昵称均需唯一，冲突时区分提示
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: parsed.data.email }, { name: parsed.data.name }] },
  })
  if (existing) {
    return { error: existing.name === parsed.data.name ? '该昵称已被注册' : '该邮箱已被注册' }
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: await hashPassword(parsed.data.password),
    },
  })

  await setSessionCookie({ userId: user.id, role: 'USER' })
  redirect('/')
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie()
  redirect('/')
}

/** 当前登录用户修改自己的昵称（name 已 @unique，需查重） */
export async function updateNicknameAction(prev: AuthState, formData: FormData): Promise<AuthState> {
  const session = await getSession()

  const parsed = z
    .object({ name: z.string().trim().min(1, '请输入昵称').max(30, '昵称最长 30 字') })
    .safeParse({ name: formData.get('name') })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? '输入有误' }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return { error: '用户不存在' }
  if (parsed.data.name === user.name) return { error: '昵称未变化' }

  const nameExists = await prisma.user.findUnique({ where: { name: parsed.data.name } })
  if (nameExists) return { error: '该昵称已被使用' }

  try {
    await prisma.user.update({ where: { id: session.userId }, data: { name: parsed.data.name } })
  } catch (e) {
    // 并发下两个请求同时改同一昵称时兜底
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: '该昵称已被使用' }
    }
    throw e
  }
  revalidatePath('/profile')
  return { success: true }
}
