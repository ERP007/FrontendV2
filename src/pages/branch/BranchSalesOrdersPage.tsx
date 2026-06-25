import { useNavigate } from '@tanstack/react-router'
import { Calendar } from 'lucide-react'
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
  PageSize,
  SalesOrderSortField,
  SalesOrderStatus,
  SortDirection,
  SoStatusTab,
} from '@/features/sales-order'
import { defaultDateRange, formatNumber } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import {
  FgFilterBar,
  FgFilterResetButton,
  FgFilterSearch,
  FgInput,
  FgPageHeader,
  FgPagination,
  FgTabs,
} from '@/shared/ui'

const breadcrumbs = [{ label: '발주' }, { label: '발주 현황' }]

const TAB_ITEMS = [
  { label: '전체', value: 'ALL' },
  { label: '진행 중', value: 'IN_PROGRESS' },
  { label: '완료', value: 'DONE' },
  { label: '취소 · 거절', value: 'CLOSED' },
]

interface SoBranchQueryState {
  endDate?: string
  page: number
  search: string
  size: PageSize
  sortDirection: SortDirection
  sortField: SalesOrderSortField
  startDate?: string
  status: SalesOrderStatus[]
}

function createDefaultQueryState(): SoBranchQueryState {
  const { endDate, startDate } = defaultDateRange(90)
  return {
    endDate,
    page: 1,
    search: '',
    size: 10,
    sortDirection: 'desc',
    sortField: 'requestedAt',
    startDate,
    status: [],
  }
}

function statusListEquals(a: SalesOrderStatus[], b: SalesOrderStatus[] | undefined) {
  const setA = new Set(a)
  const setB = new Set(b ?? [])
  if (setA.size !== setB.size) return false
  for (const value of setA) if (!setB.has(value)) return false
  return true
}

function deriveTab(status: SalesOrderStatus[]): SoStatusTab {
  const entries = Object.entries(SO_TAB_STATUS_MAP) as [SoStatusTab, SalesOrderStatus[] | undefined][]
  return entries.find(([, value]) => statusListEquals(status, value))?.[0] ?? 'ALL'
}

function deriveKpiActive(status: SalesOrderStatus[]): SalesOrderStatus | undefined {
  return status.length === 1 ? status[0] : undefined
}

export function BranchSalesOrdersPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<SoBranchQueryState>(createDefaultQueryState)

  const debouncedSearch = useDebouncedValue(state.search, 300)
  const { data: kpi } = useSalesOrderBranchKpiQuery()
  const { data } = useBranchSalesOrdersQuery({
    endDate: state.endDate,
    page: state.page,
    search: debouncedSearch || undefined,
    size: state.size,
    sortDirection: state.sortDirection,
    sortField: state.sortField,
    startDate: state.startDate,
    status: state.status,
  })

  const orders = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = Math.max(1, data?.totalPages ?? 1)

  const tab = useMemo(() => deriveTab(state.status), [state.status])
  const activeKpiStatus = useMemo(() => deriveKpiActive(state.status), [state.status])

  function patchState(patch: Partial<SoBranchQueryState>) {
    setState((prev) => ({ ...prev, ...patch }))
  }

  const rangeStart = totalElements === 0 ? 0 : (state.page - 1) * state.size + 1
  const rangeEnd = Math.min(state.page * state.size, totalElements)

  return (
    <div className="fg-content">
      <FgPageHeader breadcrumbs={breadcrumbs} title="발주 현황" />
      {kpi ? (
        <SoBranchKpiCards
          activeStatus={activeKpiStatus}
          kpi={kpi}
          onSelect={(status) => patchState({ page: 1, status: status ? [status] : [] })}
        />
      ) : null}

      <FgFilterBar
        actions={
          <FgFilterResetButton onClick={() => setState(createDefaultQueryState())} />
        }
      >
        <FgFilterSearch
          placeholder="요청번호 또는 요청자 검색"
          value={state.search}
          onChange={(event) => patchState({ page: 1, search: event.target.value })}
        />
        <SoBranchStatusFilter
          value={state.status}
          onChange={(status) => patchState({ page: 1, status: status ?? [] })}
        />
        <FgInput
          leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
          rootClassName="w-44"
          type="date"
          value={state.startDate ?? ''}
          onChange={(event) => patchState({ page: 1, startDate: event.target.value || undefined })}
        />
        <span className="text-faint">~</span>
        <FgInput
          leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
          rootClassName="w-44"
          type="date"
          value={state.endDate ?? ''}
          onChange={(event) => patchState({ page: 1, endDate: event.target.value || undefined })}
        />
      </FgFilterBar>

      <div className="flex items-center justify-between gap-4">
        <FgTabs
          items={TAB_ITEMS}
          value={tab}
          onValueChange={(value) =>
            patchState({ page: 1, status: SO_TAB_STATUS_MAP[value as SoStatusTab] ?? [] })
          }
        />
        <span className="text-label text-muted">
          전체 <strong className="text-ink">{formatNumber(totalElements)}</strong>건 중 {rangeStart}–
          {rangeEnd}
        </span>
      </div>
      <SoBranchTable
        rows={orders}
        sortDirection={state.sortDirection}
        sortField={state.sortField}
        onOpen={(order) =>
          void navigate({ params: { soNo: order.code }, to: '/branch/sales-orders/$soNo' })
        }
        onSortChange={(sortField, sortDirection) =>
          patchState({ page: 1, sortDirection, sortField })
        }
      />
      <FgPagination
        page={state.page}
        pageSize={state.size}
        pageSizeOptions={[10, 20, 50]}
        totalCount={totalElements}
        totalPages={totalPages}
        onPageChange={(nextPage) => patchState({ page: nextPage })}
        onPageSizeChange={(size) => patchState({ page: 1, size: size as PageSize })}
      />
    </div>
  )
}
