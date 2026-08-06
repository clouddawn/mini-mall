'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { updateNicknameAction } from '@/lib/actions/auth'

interface EditNicknameProps {
  currentName: string
}

export function EditNickname({ currentName }: EditNicknameProps) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setError(undefined)
          setEditing(true)
        }}
        className="ml-3 align-middle text-xs text-ink-faint underline-offset-4 hover:text-ink hover:underline"
      >
        编辑
      </button>
    )
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateNicknameAction(null, formData)
    setPending(false)
    if (result && 'error' in result) {
      setError(result.error)
    } else {
      // 保存成功：服务端 revalidatePath 会刷新昵称展示，直接收起编辑态
      setEditing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-center gap-2">
      <input
        name="name"
        defaultValue={currentName}
        maxLength={30}
        required
        autoFocus
        className="input-base !py-1.5 !text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="btn bg-ink px-3 py-1.5 text-xs text-paper hover:bg-vermilion"
      >
        {pending ? '保存中…' : '保存'}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-xs text-ink-soft underline-offset-4 hover:text-ink hover:underline"
      >
        取消
      </button>
      {error && <span className="text-xs text-vermilion">{error}</span>}
    </form>
  )
}
