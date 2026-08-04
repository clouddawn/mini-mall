'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import type { Category } from '@prisma/client'
import { createCategoryAction, updateCategoryAction, type AdminActionResult } from '@/lib/actions/admin'
import { Input } from '@/components/ui/Input'

interface CategoryFormProps {
  category?: Category
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const action = (prev: AdminActionResult | null, formData: FormData) =>
    category ? updateCategoryAction(prev, category.id, formData) : createCategoryAction(prev, formData)
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    async (prev, formData) => {
      const result = await action(prev, formData)
      if ('success' in result) router.push('/admin/categories')
      return result
    },
    null,
  )

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {state && 'error' in state && (
        <p className="border border-vermilion/30 bg-vermilion-light px-3 py-2 text-sm text-vermilion">{state.error}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="name" label="分类名称" defaultValue={category?.name} required placeholder="如：咖啡器具" />
        <Input
          name="slug"
          label="分类标识 (slug)"
          defaultValue={category?.slug}
          required
          placeholder="coffee-tools"
          hint="小写字母、数字、连字符"
        />
      </div>

      <Input name="image" label="图片 URL（可选）" defaultValue={category?.image ?? ''} placeholder="https://…" />

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-xs font-medium tracking-widest text-ink-soft uppercase">
          分类描述（可选）
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={category?.description ?? ''}
          className="input-base resize-y"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn bg-vermilion px-6 text-white hover:bg-vermilion-dark">
          {pending ? '保存中…' : category ? '保存修改' : '创建分类'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/categories')}
          className="btn border border-ink/25 text-ink-soft hover:border-ink hover:text-ink"
        >
          取消
        </button>
      </div>
    </form>
  )
}
