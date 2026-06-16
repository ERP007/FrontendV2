import { useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import {
  createDefaultSoFilter,
  filterSalesOrders,
  SALES_ORDER_FIXTURES,
  SoFilterBar,
  SoHqKpiCards,
  SoTable,
  useSalesOrderHqKpiQuery,
} from '@/features/sales-order'
import type { SalesOrderFilter } from '@/features/sales-order'
import { formatNumber } from '@/shared/lib/format'
import { FgBadge, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '발주' }, { label: '발주 요청' }]

export function SalesOrdersPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<SalesOrderFilter>(createDefaultSoFilter)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: kpi } = useSalesOrderHqKpiQuery()
  const filtered = useMemo(() => filterSalesOrders(SALES_ORDER_FIXTURES, filter), [filter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const branchOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const order of SALES_ORDER_FIXTURES) {
      if (!seen.has(order.branchCode)) seen.set(order.branchCode, order.branchName)
    }
    return Array.from(seen.entries()).map(([code, name]) => ({ code, name }))
  }, [])

  function handleFilterChange(next: SalesOrderFilter) {
    setFilter(next)
    setPage(1)
  }

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, filtered.length)

  return (
    <div className="fg-content">
      <FgPageHeader
        badge={<FgBadge variant="primary">본사</FgBadge>}
        breadcrumbs={breadcrumbs}
        title="발주 요청"
      />
      {kpi && <SoHqKpiCards kpi={kpi} />}
      <SoFilterBar
        branches={branchOptions}
        filter={filter}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(createDefaultSoFilter())}
      />
      <SoTable
        header={
          <span>
            전체 <strong className="text-ink">{formatNumber(filtered.length)}</strong>건 중 {rangeStart}–
            {rangeEnd}
          </span>
        }
        orders={pageRows}
        onOpen={(order) =>
          void navigate({ params: { soNo: order.reqNo }, to: '/sales-orders/$soNo' })
        }
      />
      <FgPagination
        page={page}
        pageSize={pageSize}
        totalCount={filtered.length}
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
