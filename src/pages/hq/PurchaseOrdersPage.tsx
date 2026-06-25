import { useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { SortingState } from '@tanstack/react-table'

import {
  PoFilterBar,
  PoKpiCards,
  PoTable,
  usePurchaseOrderKpiQuery,
  usePurchaseOrdersQuery,
  usePurchaseOrderVendorsQuery,
} from '@/features/purchase-order'
import type {
  PoKpiFilter,
  SearchPurchaseOrderRequest,
  SortField,
} from '@/features/purchase-order'
import { formatNumber } from '@/shared/lib/format'
import { FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '구매' }, { label: '구매 현황' }]

const DEFAULT_PARAMS: SearchPurchaseOrderRequest = { page: 1 }

const SORTABLE_FIELDS: ReadonlySet<SortField> = new Set(['createdAt', 'totalAmount'])

export function PurchaseOrdersPage() {
  const navigate = useNavigate()
  const [params, setParams] = useState<SearchPurchaseOrderRequest>(DEFAULT_PARAMS)

  const { data: kpi } = usePurchaseOrderKpiQuery()
  const { data: vendors } = usePurchaseOrderVendorsQuery()
  const { data } = usePurchaseOrdersQuery(params)

  const rows = data?.content ?? []

  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 1
  const page = params.page ?? 1
  const size = params.size ?? 20
  const rangeStart = totalElements === 0 ? 0 : (page - 1) * size + 1
  const rangeEnd = Math.min(page * size, totalElements)

  const sorting: SortingState = useMemo(() => {
    const field = (params.sortField ?? 'createdAt') as SortField
    const desc = (params.sortDirection ?? 'desc') === 'desc'
    return [{ desc, id: field }]
  }, [params.sortField, params.sortDirection])

  function handleSortingChange(next: SortingState) {
    const first = next[0]
    if (!first || !SORTABLE_FIELDS.has(first.id as SortField)) {
      setParams((prev) => ({ ...prev, sortDirection: undefined, sortField: undefined }))
      return
    }
    setParams((prev) => ({
      ...prev,
      sortDirection: first.desc ? 'desc' : 'asc',
      sortField: first.id as SortField,
    }))
  }

  function handleKpiSelect(filter: PoKpiFilter) {
    if (filter === 'all') {
      setParams(DEFAULT_PARAMS)
      return
    }
    const status = filter === 'draft' ? 'DRAFT' : 'APPROVED'
    setParams({ ...DEFAULT_PARAMS, status })
  }

  return (
    <div className="fg-content">
      <FgPageHeader breadcrumbs={breadcrumbs} title="구매 현황" />
      {kpi ? <PoKpiCards kpi={kpi} onSelect={handleKpiSelect} /> : null}
      <PoFilterBar
        params={params}
        vendors={vendors}
        onChange={setParams}
        onReset={() => setParams(DEFAULT_PARAMS)}
      />
      <PoTable
        header={
          <span>
            전체 <strong className="text-ink">{formatNumber(totalElements)}</strong>건 중{' '}
            {rangeStart}–{rangeEnd}
          </span>
        }
        rows={rows}
        sorting={sorting}
        onOpen={(row) =>
          void navigate({ params: { poNo: row.code }, to: '/purchase-orders/$poNo' })
        }
        onSortingChange={handleSortingChange}
      />
      <FgPagination
        page={page}
        pageSize={size}
        totalCount={totalElements}
        totalPages={totalPages}
        onPageChange={(nextPage) => setParams((prev) => ({ ...prev, page: nextPage }))}
        onPageSizeChange={(nextSize) =>
          setParams((prev) => ({
            ...prev,
            page: 1,
            size: nextSize as SearchPurchaseOrderRequest['size'],
          }))
        }
      />
    </div>
  )
}
