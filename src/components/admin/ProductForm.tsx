'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import type { Category, Product } from '@prisma/client'
import { createProductAction, updateProductAction, type AdminActionResult } from '@/lib/actions/admin'
import { Input } from '@/components/ui/Input'

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const action = (prev: AdminActionResult | null, formData: FormData) =>
    product ? updateProductAction(prev, product.id, formData) : createProductAction(prev, formData)
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    async (prev, formData) => {
      const result = await action(prev, formData)
      if ('success' in result) router.push('/admin/products')
      return result
    },
    null,
  )

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {state && 'error' in state && (
        <p className="border border-vermilion/30 bg-vermilion-light px-3 py-2 text-sm text-vermilion">{state.error}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="name" label="商品名称" defaultValue={product?.name} required placeholder="如：原木手冲咖啡杯" />
        <Input
          name="slug"
          label="商品标识 (slug)"
          defaultValue={product?.slug}
          required
          placeholder="小写字母、数字、连字符"
          hint="用于商品详情页 URL"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Input name="price" label="价格（分）" type="number" min={1} defaultValue={product?.price} required placeholder="如 1990 = ¥19.90" />
        <Input name="stock" label="库存" type="number" min={0} defaultValue={product?.stock} required />
        <div className="space-y-1.5">
          <label htmlFor="categoryId" className="block text-xs font-medium tracking-widest text-ink-soft uppercase">
            分类
          </label>
          <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId ?? ''} className="input-base">
            <option value="" disabled>
              选择分类
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        name="image"
        label="图片 URL（可选）"
        defaultValue={product?.image ?? ''}
        placeholder="https://…"
        hint="留空则显示占位图"
      />

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-xs font-medium tracking-widest text-ink-soft uppercase">
          商品描述（可选）
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={product?.description ?? ''}
          className="input-base resize-y"
          placeholder="材质、工艺、使用场景…"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn bg-vermilion px-6 text-white hover:bg-vermilion-dark">
          {pending ? '保存中…' : product ? '保存修改' : '创建商品'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="btn border border-ink/25 text-ink-soft hover:border-ink hover:text-ink"
        >
          取消
        </button>
      </div>
    </form>
  )
}
