import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  applyStatusTab,
  createDefaultSoFilter,
  deriveSoBranchKpi,
  filterSalesOrders,
  MY_BRANCH,
  SALES_ORDER_FIXTURES,
  SoBranchKpiCards,
  SoBranchTable,
  SoFilterBar,
} from '@/features/sales-order'
import type { SalesOrderFilter, SoStatusTab } from '@/features/sales-order'
import { formatNumber } from '@/shared/lib/format'
import { FgBadge, FgButton, FgPageHeader, FgPagination, FgTabs } from '@/shared/ui'

const breadcrumbs = [{ label: '발주' }, { label: '내 지점 발주 요청' }]

const MY_ORDERS = SALES_ORDER_FIXTURES.filter((order) => order.branchCode === MY_BRANCH.code)

export function BranchSalesOrdersPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<SalesOrderFilter>(createDefaultSoFilter)
  const [tab, setTab] = useState<SoStatusTab>('ALL')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const kpi = useMemo(() => deriveSoBranchKpi(MY_ORDERS), [])
  const filtered = useMemo(() => filterSalesOrders(MY_ORDERS, filter), [filter])
  const tabbed = useMemo(() => applyStatusTab(filtered, tab), [filtered, tab])

  const tabCounts = useMemo(
    () => ({
      all: filtered.length,
      closed: applyStatusTab(filtered, 'CLOSED').length,
      done: applyStatusTab(filtered, 'DONE').length,
      inProgress: applyStatusTab(filtered, 'IN_PROGRESS').length,
    }),
    [filtered],
  )

  const totalPages = Math.max(1, Math.ceil(tabbed.length / pageSize))
  const pageRows = tabbed.slice((page - 1) * pageSize, page * pageSize)

  function handleFilterChange(next: SalesOrderFilter) {
    setFilter(next)
    setPage(1)
  }

  const rangeStart = tabbed.length === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, tabbed.length)

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <FgButton
            leftIcon={<Plus aria-hidden className="h-4 w-4" />}
            variant="primary"
            onClick={() => void navigate({ to: '/branch/sales-orders/new' })}
          >
            발주 요청 등록
          </FgButton>
        }
        badge={
          <FgBadge variant="primary">
            {MY_BRANCH.name} · {MY_BRANCH.code}
          </FgBadge>
        }
        breadcrumbs={breadcrumbs}
        title="내 지점 발주 요청"
      />
      <SoBranchKpiCards kpi={kpi} />
      <SoFilterBar
        filter={filter}
        searchPlaceholder="요청번호 또는 부품명·코드 검색"
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(createDefaultSoFilter())}
      />
      <div className="flex items-center justify-between gap-4">
        <FgTabs
          items={[
            { count: tabCounts.all, label: '전체', value: 'ALL' },
            { count: tabCounts.inProgress, label: '진행 중', value: 'IN_PROGRESS' },
            { count: tabCounts.done, label: '완료', value: 'DONE' },
            { count: tabCounts.closed, label: '취소 · 거절', value: 'CLOSED' },
          ]}
          value={tab}
          onValueChange={(value) => {
            setTab(value as SoStatusTab)
            setPage(1)
          }}
        />
        <span className="text-label text-muted">
          전체 <strong className="text-ink">{formatNumber(tabbed.length)}</strong>건 중 {rangeStart}–
          {rangeEnd}
        </span>
      </div>
      <SoBranchTable
        orders={pageRows}
        onArrival={(order) =>
          void navigate({ params: { soNo: order.reqNo }, to: '/branch/sales-orders/$soNo/arrival' })
        }
        onOpen={(order) => void navigate({ params: { soNo: order.reqNo }, to: '/sales-orders/$soNo' })}
      />
      <FgPagination
        page={page}
        pageSize={pageSize}
        totalCount={tabbed.length}
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
