import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'

import {
  DEFAULT_ITEM_FILTER,
  ItemFilterBar,
  ItemTable,
  useItemsQuery,
} from '@/features/item'
import type { ItemFilter, ItemListParams } from '@/features/item'
import { formatNumber } from '@/shared/lib/format'
import { FgEmptyState, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '마스터' }, { label: '부품 마스터' }]

export function ItemsPage() {
  const [filter, setFilter] = useState<ItemFilter>(DEFAULT_ITEM_FILTER)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const itemListParams = useMemo<ItemListParams>(
    () => ({ ...filter, page, size: pageSize }),
    [filter, page, pageSize],
  )
  const { data, isFetching, isLoading } = useItemsQuery(itemListParams)

  const items = data?.content ?? []
  const totalCount = data?.totalElements ?? 0
  const totalPages = Math.max(1, data?.totalPages ?? 1)

  function handleFilterChange(next: ItemFilter) {
    setFilter(next)
    setPage(1)
  }

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min((page - 1) * pageSize + items.length, totalCount)

  return (
    <div className="fg-content">
      <FgPageHeader
        breadcrumbs={breadcrumbs}
        title="부품 마스터"
      />
      <ItemFilterBar
        filter={filter}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(DEFAULT_ITEM_FILTER)}
      />
      <ItemTable
        emptyState={
          isLoading ? (
            <FgEmptyState
              description="잠시만 기다려 주세요"
              icon={<Loader2 aria-hidden className="h-6 w-6 animate-spin" />}
              title="부품을 불러오는 중입니다"
            />
          ) : undefined
        }
        header={
          <span>
            {isFetching ? '새로고침 중 · ' : null}
            전체 <strong className="text-ink">{formatNumber(totalCount)}</strong>건 중 {rangeStart}-
            {rangeEnd}
          </span>
        }
        items={items}
      />
      <FgPagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}
