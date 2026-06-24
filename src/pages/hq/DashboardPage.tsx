import { useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Boxes, ChevronRight, ClipboardList, ShoppingCart } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  ActivityChart,
  DASHBOARD_KPI_FIXTURE,
  DashboardKpiGrid,
  TODO_FIXTURES,
  TodoPanel,
  useActivitySummaryQuery,
} from '@/features/dashboard'
import { StockKpiCards, useStockKpiQuery } from '@/features/stock'
import { FgCard, FgPageHeader } from '@/shared/ui'

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
  // 상단 재고 KPI. 집계 범위는 호출자 소속(ADMIN·HQ는 전사)으로 백엔드가 강제한다.
  const stockKpiQuery = useStockKpiQuery()
  // 최근 7일 활동 차트. 집계 범위는 KPI와 동일하게 호출자 소속(ADMIN·HQ는 전사)으로 백엔드가 강제한다.
  const activitySummaryQuery = useActivitySummaryQuery()

  return (
    <div className="fg-content">
      <FgPageHeader breadcrumbs={breadcrumbs} title="본사 대시보드" />

      {/* 상단 재고 KPI 4종 — 재고 조회와 동일한 카드(StockKpiCards)를 실데이터로 렌더.
          카드 클릭 시 재고 조회(상태 필터)·재고 이력(최근 7일)로 이동한다. */}
      {stockKpiQuery.data ? (
        <StockKpiCards
          kpi={stockKpiQuery.data}
          onRecentMovementsClick={() =>
            void navigate({
              search: {
                from: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
                to: dayjs().format('YYYY-MM-DD'),
              },
              to: '/stock-movements',
            })
          }
          onStatusSelect={(status) => void navigate({ search: { status }, to: '/stocks' })}
        />
      ) : null}

      {/* 구매·발주 KPI — Procurement·Sales 연동 전까지 fixture */}
      <DashboardKpiGrid kpi={DASHBOARD_KPI_FIXTURE} />

      <div className="grid grid-cols-[1.15fr_1fr] gap-5">
        <TodoPanel
          items={TODO_FIXTURES}
          onSelect={(item) =>
            void navigate({ params: { soNo: item.reqNo }, to: '/sales-orders/$soNo' })
          }
        />
        {activitySummaryQuery.isError ? (
          <FgCard className="flex h-full items-center justify-center text-muted">
            최근 7일 활동을 불러오지 못했습니다.
          </FgCard>
        ) : activitySummaryQuery.data ? (
          <ActivityChart summary={activitySummaryQuery.data} />
        ) : (
          <FgCard className="flex h-full items-center justify-center text-muted">
            최근 7일 활동을 불러오는 중…
          </FgCard>
        )}
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
