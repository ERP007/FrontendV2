import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  createDefaultPoFilter,
  derivePoKpi,
  filterPurchaseOrders,
  PoFilterBar,
  PoKpiCards,
  PoTable,
  PURCHASE_ORDER_FIXTURES,
  SUPPLIER_FIXTURES,
} from '@/features/purchase-order'
import type { PurchaseOrderFilter } from '@/features/purchase-order'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '구매' }, { label: '구매 주문' }]

export function PurchaseOrdersPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<PurchaseOrderFilter>(createDefaultPoFilter)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const kpi = useMemo(() => derivePoKpi(PURCHASE_ORDER_FIXTURES), [])
  const filtered = useMemo(() => filterPurchaseOrders(PURCHASE_ORDER_FIXTURES, filter), [filter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  function handleFilterChange(next: PurchaseOrderFilter) {
    setFilter(next)
    setPage(1)
  }

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, filtered.length)

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <FgButton
            leftIcon={<Plus aria-hidden className="h-4 w-4" />}
            variant="primary"
            onClick={() => void navigate({ to: '/purchase-orders/new' })}
          >
            구매 주문 등록
          </FgButton>
        }
        breadcrumbs={breadcrumbs}
        title="구매 주문"
      />
      <PoKpiCards kpi={kpi} />
      <PoFilterBar
        filter={filter}
        suppliers={SUPPLIER_FIXTURES}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(createDefaultPoFilter())}
      />
      <PoTable
        header={
          <span>
            전체 <strong className="text-ink">{formatNumber(filtered.length)}</strong>건 중 {rangeStart}–
            {rangeEnd}
          </span>
        }
        orders={pageRows}
        onOpen={(order) =>
          void navigate({ params: { poNo: order.poNo }, to: '/purchase-orders/$poNo' })
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
