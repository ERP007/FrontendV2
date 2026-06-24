import { useEffect, useRef } from 'react'

import { useItemsInfiniteQuery } from '@/features/item'
import type { ItemListItem } from '@/features/item'
import type { SoDraftLine } from '@/features/sales-order'
import { stockDetailQueryOptions } from '@/features/stock'
import { queryClient } from '@/shared/api'
import { formatNumber } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'

function itemToLinePatch(item: ItemListItem): Partial<SoDraftLine> {
  return {
    branchStock: null,
    itemCode: item.sku,
    itemName: item.name,
    safetyStock: null,
    unit: item.unit,
  }
}

async function buildLinePatch(
  item: ItemListItem,
  warehouseCode: string | undefined,
): Promise<Partial<SoDraftLine>> {
  const base = itemToLinePatch(item)
  if (!warehouseCode) return base
  try {
    const stock = await queryClient.fetchQuery(
      stockDetailQueryOptions({ sku: item.sku, warehouseCode }),
    )
    return {
      ...base,
      branchStock: stock.quantity,
      safetyStock: stock.safetyStock,
    }
  } catch {
    return base
  }
}

export interface SoItemSearchPanelProps {
  onSelect: (patch: Partial<SoDraftLine>) => void
  query: string
  warehouseCode: string | undefined
}

/** SO 발주 라인용 부품 검색 패널 (생성·수정 페이지 공용) */
export function SoItemSearchPanel({ onSelect, query, warehouseCode }: SoItemSearchPanelProps) {
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
          data-testid="so-item-search-result"
          type="button"
          onMouseDown={(event) => {
            event.preventDefault()
            void buildLinePatch(item, warehouseCode).then(onSelect)
          }}
        >
          <span className="min-w-0">
            <span className="block truncate text-label font-semibold text-ink">{item.name}</span>
            <span className="block text-meta font-medium text-faint">{item.sku}</span>
          </span>
          <span className="shrink-0 text-meta font-semibold text-muted">
            안전재고 {formatNumber(item.safetyStock)} {item.unit}
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
