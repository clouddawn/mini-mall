/** 简单的类名拼接工具（替代 clsx） */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** 生成商品 slug：中文转拼音的兜底方案 — 使用时间戳+随机数保证唯一，或由调用方传入 */
export function slugify(text: string): string {
  const ascii = text
    .toLowerCase()
    .trim()
    .replace(/[^\w一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return ascii || `item-${Date.now()}`
}
