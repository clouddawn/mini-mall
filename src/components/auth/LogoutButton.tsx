'use client'

import { logoutAction } from '@/lib/actions/auth'

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button type="submit" className={`btn px-3 py-1.5 text-xs ${className ?? ''}`}>
        退出登录
      </button>
    </form>
  )
}
