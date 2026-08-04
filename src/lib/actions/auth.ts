'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, setSessionCookie, clearSessionCookie } from '@/lib/auth'

export type AuthState = { error?: string } | null

const loginSchema = z.object({
  email: z.string().trim().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少 6 位'),
})

const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, '请输入昵称').max(30, '昵称最长 30 字'),
})

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '输入有误' }
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!user || !(await verifyPassword(parsed.data.password, user.password))) {
    return { error: '邮箱或密码不正确' }
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

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return { error: '该邮箱已被注册' }
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
