import { useEffect, useRef } from 'react'

import { useItemsInfiniteQuery } from '@/features/item'
import type { PoDraftLine } from '@/features/purchase-order'
import { formatNumber } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'

export interface PoItemSearchPanelProps {
  onSelect: (patch: Partial<PoDraftLine>) => void
  query: string
}

/**
 * PO 라인 부품 검색 패널. item 도메인과 purchase-order 도메인을 잇는 page 레벨 합성 위젯이라
 * features 안이 아닌 pages 에 둔다. (생성/수정 페이지 공용)
 */
export function PoItemSearchPanel({ onSelect, query }: PoItemSearchPanelProps) {
  const debouncedQuery = useDebouncedValue(query, 300)
  const search = debouncedQuery.trim()

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useItemsInfiniteQuery({ search: search || undefined })

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '40px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const items = data?.pages.flatMap((page) => page.content) ?? []
  const totalElements = data?.pages[0]?.totalElements ?? 0
  const isInitialLoading = isFetching && !data

  return (
    <div className="max-h-72 overflow-y-auto">
      <p className="border-b border-line-soft px-3.5 py-2 text-meta font-semibold text-faint">
        검색 결과 {formatNumber(totalElements)}건
      </p>
      {items.map((item) => (
        <button
          key={item.sku}
          className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-primary-soft"
          type="button"
          onMouseDown={(event) => {
            event.preventDefault()
            onSelect({
              itemName: item.name,
              sku: item.sku,
              unit: item.unit,
              unitPrice: item.unitPrice,
            })
          }}
        >
          <span className="min-w-0">
            <span className="block truncate text-label font-semibold text-ink">{item.name}</span>
            <span className="block text-meta font-medium text-faint">{item.sku}</span>
          </span>
          <span className="shrink-0 text-meta font-semibold text-muted">
            {formatNumber(item.unitPrice)} 원
          </span>
        </button>
      ))}
      {isInitialLoading ? (
        <p className="px-3.5 py-3 text-meta text-faint">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="px-3.5 py-3 text-meta text-faint">일치하는 부품이 없습니다</p>
      ) : null}
      <div ref={sentinelRef} className="h-px" />
      {isFetchingNextPage ? (
        <p className="px-3.5 py-2 text-meta text-faint">더 불러오는 중…</p>
      ) : null}
    </div>
  )
}
