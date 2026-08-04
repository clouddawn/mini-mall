'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

/** 搜索框：回车后写入 URL query 参数 */
export function SearchBar({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    const q = value.trim()
    if (q) params.set('q', q)
    else params.delete('q')
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <form onSubmit={submit} className="relative">
      <svg
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索商品…"
        className="input-base pl-9"
        aria-label="搜索商品"
      />
    </form>
  )
}
