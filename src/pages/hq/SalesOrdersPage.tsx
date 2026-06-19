import { useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import {
  SoFilterBar,
  SoHqKpiCards,
  SoTable,
  useHqSalesOrdersQuery,
  useSalesOrderHqKpiQuery,
} from '@/features/sales-order'
import type {
  PageSize,
  SalesOrderSortField,
  SalesOrderStatus,
  SoFilterBarValues,
  SortDirection,
} from '@/features/sales-order'
import { useHqWarehousesQuery } from '@/features/warehouse'
import { formatNumber } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { FgBadge, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '발주' }, { label: '발주 요청' }]

interface SoHqQueryState {
  endDate?: string
  page: number
  search: string
  size: PageSize
  sortDirection: SortDirection
  sortField: SalesOrderSortField
  startDate?: string
  status: SalesOrderStatus[]
  warehouseCode?: string
}

function createDefaultQueryState(): SoHqQueryState {
  return {
    endDate: undefined,
    page: 1,
    search: '',
    size: 20,
    sortDirection: 'desc',
    sortField: 'requestedAt',
    startDate: undefined,
    status: [],
    warehouseCode: undefined,
  }
}

export function SalesOrdersPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<SoHqQueryState>(createDefaultQueryState)

  const debouncedSearch = useDebouncedValue(state.search, 300)
  const { data: kpi } = useSalesOrderHqKpiQuery()
  const { data: warehouses } = useHqWarehousesQuery()
  const { data: page } = useHqSalesOrdersQuery({
    endDate: state.endDate,
    page: state.page,
    search: debouncedSearch || undefined,
    size: state.size,
    sortDirection: state.sortDirection,
    sortField: state.sortField,
    startDate: state.startDate,
    status: state.status,
    warehouseCode: state.warehouseCode,
  })

  const orders = page?.content ?? []
  const totalElements = page?.totalElements ?? 0
  const totalPages = page?.totalPages ?? 1

  const activeKpiStatus = useMemo<SalesOrderStatus | undefined>(
    () => (state.status.length === 1 ? state.status[0] : undefined),
    [state.status],
  )

  const rangeStart = totalElements === 0 ? 0 : (state.page - 1) * state.size + 1
  const rangeEnd = Math.min(state.page * state.size, totalElements)

  function handleFilterChange(next: SoFilterBarValues) {
    setState((prev) => ({
      ...prev,
      endDate: next.endDate,
      page: 1,
      search: next.search,
      startDate: next.startDate,
      status: next.status,
      warehouseCode: next.warehouseCode,
    }))
  }

  function handleReset() {
    setState(createDefaultQueryState())
  }

  function handleKpiSelect(status: SalesOrderStatus | undefined) {
    setState((prev) => ({
      ...prev,
      page: 1,
      status: status ? [status] : [],
    }))
  }

  function handleSortChange(field: SalesOrderSortField, direction: SortDirection) {
    setState((prev) => ({ ...prev, page: 1, sortDirection: direction, sortField: field }))
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        badge={<FgBadge variant="primary">본사</FgBadge>}
        breadcrumbs={breadcrumbs}
        title="발주 요청"
      />
      {kpi && (
        <SoHqKpiCards activeStatus={activeKpiStatus} kpi={kpi} onSelect={handleKpiSelect} />
      )}
      <SoFilterBar
        values={{
          endDate: state.endDate,
          search: state.search,
          startDate: state.startDate,
          status: state.status,
          warehouseCode: state.warehouseCode,
        }}
        warehouses={warehouses}
        onChange={handleFilterChange}
        onReset={handleReset}
      />
      <SoTable
        header={
          <span>
            전체 <strong className="text-ink">{formatNumber(totalElements)}</strong>건 중 {rangeStart}–
            {rangeEnd}
          </span>
        }
        rows={orders}
        sortDirection={state.sortDirection}
        sortField={state.sortField}
        onOpen={(order) =>
          void navigate({ params: { soNo: order.code }, to: '/sales-orders/$soNo' })
        }
        onSortChange={handleSortChange}
      />
      <FgPagination
        page={state.page}
        pageSize={state.size}
        totalCount={totalElements}
        totalPages={totalPages}
        onPageChange={(next) => setState((prev) => ({ ...prev, page: next }))}
        onPageSizeChange={(size) =>
          setState((prev) => ({ ...prev, page: 1, size: size as PageSize }))
        }
      />
    </div>
  )
}
