import { CategoryForm } from '@/components/admin/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div>
      <div className="mb-8 border-b border-line pb-6">
        <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Categories / New</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">新增分类</h1>
      </div>
      <CategoryForm />
    </div>
  )
}
