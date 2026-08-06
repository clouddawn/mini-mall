'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@prisma/client'
import { updateUserAction, type AdminActionResult } from '@/lib/actions/admin'
import { Input } from '@/components/ui/Input'

interface UserFormProps {
  user: User
  isSelf: boolean // 当前登录管理员是否为该用户本人（禁止自我降级）
}

export function UserForm({ user, isSelf }: UserFormProps) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    async (prev, formData) => {
      const result = await updateUserAction(prev, user.id, formData)
      if ('success' in result) router.refresh()
      return result
    },
    null,
  )

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {state && 'error' in state && (
        <p className="border border-vermilion/30 bg-vermilion-light px-3 py-2 text-sm text-vermilion">{state.error}</p>
      )}

      <Input name="name" label="昵称" defaultValue={user.name} required placeholder="用户昵称" maxLength={30} />

      <div className="space-y-1.5">
        <label htmlFor="role" className="block text-xs font-medium tracking-widest text-ink-soft uppercase">
          角色
        </label>
        <select
          id="role"
          name="role"
          defaultValue={user.role}
          disabled={isSelf}
          className="input-base disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="USER">用户</option>
          <option value="ADMIN">管理员</option>
        </select>
        {isSelf && <p className="text-xs text-ink-faint">不能修改自己的角色</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn bg-vermilion px-6 text-white hover:bg-vermilion-dark">
          {pending ? '保存中…' : '保存修改'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/users')}
          className="btn border border-ink/25 text-ink-soft hover:border-ink hover:text-ink"
        >
          返回列表
        </button>
      </div>
    </form>
  )
}
