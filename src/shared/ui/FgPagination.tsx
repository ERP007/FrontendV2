import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { FgButton } from '@/shared/ui/FgButton'

type PageItem = number | 'ellipsis'

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1])

  return Array.from(items)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
    .flatMap((page, index, pages) => {
      const previous = pages[index - 1]
      return previous && page - previous > 1 ? ['ellipsis' as const, page] : [page]
    })
}

export interface FgPaginationProps {
  className?: string
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  page: number
  pageSize?: number
  pageSizeOptions?: number[]
  totalCount?: number
  totalPages: number
}

export function FgPagination({
  className,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  totalCount,
  totalPages,
}: FgPaginationProps) {
  const pageItems = getPageItems(page, totalPages)

  return (
    <nav className={cn('flex items-center justify-between gap-4 text-label text-muted', className)} aria-label="Pagination">
      <div className="flex items-center gap-2">
        {pageSize && onPageSizeChange ? (
          <>
            <span>페이지당</span>
            <select
              className="h-9 rounded-control border border-line bg-surface px-3 text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span>행</span>
          </>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5">
        <FgButton
          disabled={page <= 1}
          leftIcon={<ChevronLeft aria-hidden className="h-4 w-4" />}
          onClick={() => onPageChange?.(page - 1)}
          size="sm"
        >
          이전
        </FgButton>
        {pageItems.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`${item}-${index}`} className="px-2 text-faint">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={cn(
                'h-9 min-w-9 rounded-control border px-3 text-sm font-semibold transition-colors',
                item === page
                  ? 'border-navy bg-navy text-surface'
                  : 'border-line bg-surface text-ink-2 hover:bg-background',
              )}
              onClick={() => onPageChange?.(item)}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          ),
        )}
        <FgButton
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          rightIcon={<ChevronRight aria-hidden className="h-4 w-4" />}
          size="sm"
        >
          다음
        </FgButton>
      </div>
      <div className="min-w-24 text-right">{totalCount !== undefined ? `총 ${totalCount.toLocaleString()}건` : null}</div>
    </nav>
  )
}
