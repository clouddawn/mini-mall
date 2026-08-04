import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: '登录 · Mini Mall' }

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display mb-8 text-center text-2xl font-semibold">登 录</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  )
}
