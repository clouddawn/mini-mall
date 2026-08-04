import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: '注册 · Mini Mall' }

export default function RegisterPage() {
  return (
    <>
      <h1 className="font-display mb-8 text-center text-2xl font-semibold">注 册</h1>
      <RegisterForm />
    </>
  )
}
