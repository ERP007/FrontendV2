import { useNavigate } from '@tanstack/react-router'
import { Calendar, Plus, RotateCcw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  SO_TAB_STATUS_MAP,
  SoBranchKpiCards,
  SoBranchStatusFilter,
  SoBranchTable,
  useBranchSalesOrdersQuery,
  useSalesOrderBranchKpiQuery,
} from '@/features/sales-order'
import type {
  BranchSalesOrderListParams,
  PageSize,
  SalesOrderStatus,
  SoStatusTab,
} from '@/features/sales-order'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgCard, FgInput, FgPageHeader, FgPagination, FgTabs } from '@/shared/ui'

const breadcrumbs = [{ label: '발주' }, { label: '내 지점 발주 요청' }]

const TAB_ITEMS = [
  { label: '전체', value: 'ALL' },
  { label: '진행 중', value: 'IN_PROGRESS' },
  { label: '완료', value: 'DONE' },
  { label: '취소 · 거절', value: 'CLOSED' },
]

function createDefaultParams(): BranchSalesOrderListParams {
  return {
    endDate: undefined,
    page: 1,
    search: '',
    size: 10,
    sortDirection: 'desc',
    sortField: 'requestedAt',
    startDate: undefined,
    status: undefined,
  }
}

function statusListEquals(a: SalesOrderStatus[] | undefined, b: SalesOrderStatus[] | undefined) {
  const setA = new Set(a ?? [])
  const setB = new Set(b ?? [])
  if (setA.size !== setB.size) return false
  for (const value of setA) if (!setB.has(value)) return false
  return true
}

function deriveTab(status: SalesOrderStatus[] | undefined): SoStatusTab {
  const entries = Object.entries(SO_TAB_STATUS_MAP) as [SoStatusTab, SalesOrderStatus[] | undefined][]
  return entries.find(([, value]) => statusListEquals(value, status))?.[0] ?? 'ALL'
}

function deriveKpiActive(status: SalesOrderStatus[] | undefined): SalesOrderStatus | undefined {
  return status?.length === 1 ? status[0] : undefined
}

export function BranchSalesOrdersPage() {
  const navigate = useNavigate()
  const [params, setParams] = useState<BranchSalesOrderListParams>(createDefaultParams)

  const { data: kpi } = useSalesOrderBranchKpiQuery()
  const { data } = useBranchSalesOrdersQuery(params)

  const orders = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = Math.max(1, data?.totalPages ?? 1)

  const page = params.page ?? 1
  const pageSize = params.size ?? 10
  const tab = useMemo(() => deriveTab(params.status), [params.status])
  const activeKpiStatus = useMemo(() => deriveKpiActive(params.status), [params.status])

  function patchParams(patch: Partial<BranchSalesOrderListParams>) {
    setParams((prev) => ({ ...prev, ...patch }))
  }

  const rangeStart = totalElements === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalElements)

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
        breadcrumbs={breadcrumbs}
        title="내 지점 발주 요청"
      />
      {kpi ? (
        <SoBranchKpiCards
          activeStatus={activeKpiStatus}
          kpi={kpi}
          onSelect={(status) =>
            patchParams({ page: 1, status: status ? [status] : undefined })
          }
        />
      ) : null}

      <FgCard className="flex items-center gap-3 p-4">
        <FgInput
          leftIcon={<Search aria-hidden className="h-4 w-4" />}
          placeholder="요청번호 또는 부품명·코드 검색"
          rootClassName="flex-1"
          value={params.search ?? ''}
          onChange={(event) => patchParams({ page: 1, search: event.target.value })}
        />
        <SoBranchStatusFilter
          value={params.status}
          onChange={(status) => patchParams({ page: 1, status })}
        />
        <FgInput
          leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
          rootClassName="w-44"
          type="date"
          value={params.startDate ?? ''}
          onChange={(event) =>
            patchParams({ page: 1, startDate: event.target.value || undefined })
          }
        />
        <span className="text-faint">~</span>
        <FgInput
          leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
          rootClassName="w-44"
          type="date"
          value={params.endDate ?? ''}
          onChange={(event) =>
            patchParams({ page: 1, endDate: event.target.value || undefined })
          }
        />
        <FgButton
          leftIcon={<RotateCcw aria-hidden className="h-4 w-4" />}
          onClick={() => setParams(createDefaultParams())}
        >
          초기화
        </FgButton>
      </FgCard>

      <div className="flex items-center justify-between gap-4">
        <FgTabs
          items={TAB_ITEMS}
          value={tab}
          onValueChange={(value) =>
            patchParams({ page: 1, status: SO_TAB_STATUS_MAP[value as SoStatusTab] })
          }
        />
        <span className="text-label text-muted">
          전체 <strong className="text-ink">{formatNumber(totalElements)}</strong>건 중 {rangeStart}–
          {rangeEnd}
        </span>
      </div>
      <SoBranchTable
        orders={orders}
        sortDirection={params.sortDirection}
        sortField={params.sortField}
        onArrival={(order) =>
          void navigate({ params: { soNo: order.code }, to: '/branch/sales-orders/$soNo/arrival' })
        }
        onOpen={(order) =>
          void navigate({ params: { soNo: order.code }, to: '/branch/sales-orders/$soNo' })
        }
        onSortChange={(sortField, sortDirection) =>
          patchParams({ page: 1, sortDirection, sortField })
        }
      />
      <FgPagination
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50]}
        totalCount={totalElements}
        totalPages={totalPages}
        onPageChange={(nextPage) => patchParams({ page: nextPage })}
        onPageSizeChange={(size) => patchParams({ page: 1, size: size as PageSize })}
      />
    </div>
  )
}
