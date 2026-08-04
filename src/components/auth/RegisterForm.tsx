'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerAction } from '@/lib/actions/auth'
import { Input } from '@/components/ui/Input'

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, null)

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p className="border border-vermilion/30 bg-vermilion-light px-3 py-2 text-sm text-vermilion">
          {state.error}
        </p>
      )}
      <Input name="name" label="昵称" placeholder="怎么称呼你？" required autoComplete="nickname" />
      <Input name="email" type="email" label="邮箱" placeholder="you@example.com" required autoComplete="email" />
      <Input
        name="password"
        type="password"
        label="密码"
        placeholder="至少 6 位"
        required
        autoComplete="new-password"
        hint="至少 6 位字符"
      />
      <button type="submit" disabled={pending} className="btn w-full bg-vermilion text-white hover:bg-vermilion-dark">
        {pending ? '注册中…' : '注册'}
      </button>
      <p className="text-center text-sm text-ink-soft">
        已有账号？{' '}
        <Link href="/login" className="text-vermilion underline underline-offset-4 hover:text-vermilion-dark">
          登录
        </Link>
      </p>
    </form>
  )
}
