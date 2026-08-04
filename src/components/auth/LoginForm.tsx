'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction } from '@/lib/actions/auth'
import { Input } from '@/components/ui/Input'

export function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? ''
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirect" value={redirectTo} />
      {state?.error && (
        <p className="border border-vermilion/30 bg-vermilion-light px-3 py-2 text-sm text-vermilion">
          {state.error}
        </p>
      )}
      <Input name="email" type="email" label="邮箱" placeholder="you@example.com" required autoComplete="email" />
      <Input
        name="password"
        type="password"
        label="密码"
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />
      <button type="submit" disabled={pending} className="btn w-full bg-vermilion text-white hover:bg-vermilion-dark">
        {pending ? '登录中…' : '登录'}
      </button>
      <p className="text-center text-sm text-ink-soft">
        还没有账号？{' '}
        <Link href="/register" className="text-vermilion underline underline-offset-4 hover:text-vermilion-dark">
          注册
        </Link>
      </p>
    </form>
  )
}
