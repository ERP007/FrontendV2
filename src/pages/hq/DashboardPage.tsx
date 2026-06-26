import { useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'

import { ActivityChart, TodoPanel, useActivitySummaryQuery } from '@/features/dashboard'
import { PoKpiCards, usePurchaseOrderKpiQuery } from '@/features/purchase-order'
import {
  SoHqKpiCards,
  useHqSalesOrdersQuery,
  useSalesOrderHqKpiQuery,
} from '@/features/sales-order'
import { StockKpiCards, useStockKpiQuery } from '@/features/stock'
import { FgCard, FgPageHeader } from '@/shared/ui'

const breadcrumbs = [{ label: '본사' }, { label: '대시보드' }]

export function DashboardPage() {
  const navigate = useNavigate()
  // 상단 재고 KPI. 집계 범위는 호출자 소속(ADMIN·HQ는 전사)으로 백엔드가 강제한다.
  const stockKpiQuery = useStockKpiQuery()
  // 구매 KPI(구매 현황과 동일) — 전체 요청/임시저장/입고 대기. 집계 범위는 백엔드가 호출자 소속으로 강제한다.
  const poKpiQuery = usePurchaseOrderKpiQuery()
  // 발주 KPI(발주 현황과 동일) — 전체 요청/출고 대기/도착 대기.
  const soKpiQuery = useSalesOrderHqKpiQuery()
  // 할 일 목록 — 출고 대기/도착 대기/입고 발주를 최대(size 50)로 조회해 탭으로 분류.
  const todoQuery = useHqSalesOrdersQuery({ size: 50, status: ['REQUESTED', 'APPROVED', 'DELIVERED'] })
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

      {/* 구매 KPI — 구매 현황(PoKpiCards)을 실데이터로 재사용. 클릭 시 구매 현황으로 이동. */}
      {poKpiQuery.data ? (
        <PoKpiCards kpi={poKpiQuery.data} onSelect={() => void navigate({ to: '/purchase-orders' })} />
      ) : null}

      {/* 발주 KPI — 발주 현황(SoHqKpiCards)을 실데이터로 재사용. 클릭 시 발주 현황으로 이동. */}
      {soKpiQuery.data ? (
        <SoHqKpiCards kpi={soKpiQuery.data} onSelect={() => void navigate({ to: '/sales-orders' })} />
      ) : null}

      <div className="grid grid-cols-[1.15fr_1fr] gap-5">
        <TodoPanel
          items={todoQuery.data?.content ?? []}
          onSelect={(item) =>
            void navigate({ params: { soNo: item.code }, to: '/sales-orders/$soNo' })
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
    </div>
  )
}
