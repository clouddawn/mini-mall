'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { deleteProductAction, deleteCategoryAction, deleteUserAction } from '@/lib/actions/admin'

interface DeleteButtonProps {
  id: number
  kind: 'product' | 'category' | 'user'
  confirmText: string
}

export function DeleteButton({ id, kind, confirmText }: DeleteButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const deleteActions = {
    product: deleteProductAction,
    category: deleteCategoryAction,
    user: deleteUserAction,
  } as const

  function handleDelete() {
    if (!confirm(confirmText)) return
    startTransition(async () => {
      const result = await deleteActions[kind](id)
      if ('error' in result) alert(result.error)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-xs text-ink-faint underline-offset-4 transition-colors hover:text-vermilion hover:underline disabled:opacity-40"
    >
      {pending ? '删除中…' : '删除'}
    </button>
  )
}
