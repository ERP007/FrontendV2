import { useNavigate } from '@tanstack/react-router'
import { Boxes, ChevronRight, ClipboardList, RefreshCw, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { useMemo } from 'react'
import type { ReactNode } from 'react'

import {
  ACTIVITY_SUMMARY_FIXTURE,
  ActivityChart,
  DASHBOARD_KPI_FIXTURE,
  DashboardKpiGrid,
  TODO_FIXTURES,
  TodoPanel,
} from '@/features/dashboard'
import { useSalesOrderHqKpiQuery } from '@/features/sales-order'
import { FgButton, FgPageHeader } from '@/shared/ui'

const breadcrumbs = [{ label: '본사' }, { label: '대시보드' }]

interface QuickLink {
  icon: ReactNode
  label: string
  to: string
}

const quickLinks: QuickLink[] = [
  { icon: <Boxes aria-hidden className="h-4 w-4" />, label: '재고 전체 보기', to: '/stocks' },
  { icon: <ShoppingCart aria-hidden className="h-4 w-4" />, label: '구매 전체 보기', to: '/purchase-orders' },
  { icon: <ClipboardList aria-hidden className="h-4 w-4" />, label: '발주 전체 보기', to: '/sales-orders' },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const {
    data: salesOrderKpi,
    isFetching: isSalesOrderKpiFetching,
    refetch: refetchSalesOrderKpi,
  } = useSalesOrderHqKpiQuery()

  const dashboardKpi = useMemo(
    () => ({
      ...DASHBOARD_KPI_FIXTURE,
      pendingApprovalCount:
        salesOrderKpi?.pendingApprovalCount ?? DASHBOARD_KPI_FIXTURE.pendingApprovalCount,
      pendingShipCount: salesOrderKpi?.pendingShipCount ?? DASHBOARD_KPI_FIXTURE.pendingShipCount,
    }),
    [salesOrderKpi],
  )

  async function handleRefresh() {
    const result = await refetchSalesOrderKpi()
    if (result.isSuccess) {
      toast.success('대시보드를 새로고침했습니다.')
    }
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <div className="flex items-center gap-3">
            <span className="text-meta font-medium text-faint">
              {isSalesOrderKpiFetching ? '발주 KPI 동기화 중' : '마지막 업데이트 · 방금 전'}
            </span>
            <FgButton
              aria-label="새로고침"
              size="icon"
              onClick={() => void handleRefresh()}
            >
              <RefreshCw aria-hidden className="h-4 w-4" />
            </FgButton>
          </div>
        }
        breadcrumbs={breadcrumbs}
        title="본사 대시보드"
      />

      <DashboardKpiGrid kpi={dashboardKpi} />

      <div className="grid grid-cols-[1.15fr_1fr] gap-5">
        <TodoPanel
          items={TODO_FIXTURES}
          onSelect={(item) =>
            void navigate({ params: { soNo: item.reqNo }, to: '/sales-orders/$soNo' })
          }
        />
        <ActivityChart summary={ACTIVITY_SUMMARY_FIXTURE} />
      </div>

      <div className="flex items-center justify-end gap-5">
        {quickLinks.map((link) => (
          <button
            key={link.to}
            className="flex items-center gap-1.5 text-label font-semibold text-primary-strong transition-colors hover:text-brand"
            type="button"
            onClick={() => void navigate({ to: link.to })}
          >
            {link.icon}
            {link.label}
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
    </div>
  )
}
