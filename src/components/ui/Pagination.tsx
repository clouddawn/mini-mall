import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  /** 生成第 page 页的链接（不含页码参数） */
  hrefFor: (page: number) => string
}

/** 生成页码序列，如 1 … 4 5 [6] 7 8 … 12 */
function pageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

export function Pagination({ currentPage, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-1 pt-10" aria-label="分页">
      {currentPage > 1 && (
        <Link
          href={hrefFor(currentPage - 1)}
          className="px-3 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          ←
        </Link>
      )}

      {pageRange(currentPage, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`dots-${i}`} className="px-2 text-ink-faint">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            className={cn(
              'num min-w-8 px-2 py-1.5 text-center text-sm transition-colors',
              p === currentPage
                ? 'bg-ink text-paper'
                : 'text-ink-soft hover:bg-ink/5 hover:text-ink',
            )}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages && (
        <Link
          href={hrefFor(currentPage + 1)}
          className="px-3 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          →
        </Link>
      )}
    </nav>
  )
}
