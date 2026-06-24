import { ClipboardCheck, ShoppingCart, Truck } from 'lucide-react'

import { formatCurrency, formatNumber } from '@/shared/lib/format'
import { FgBadge, FgKpiCard } from '@/shared/ui'

import type { DashboardKpi } from '../model/types'

/**
 * 대시보드 보조 KPI(구매 2 + 발주 2). 상단 재고 KPI 4종은 StockKpiCards가 실데이터로 그리며,
 * 이 그리드는 Procurement·Sales 연동 전까지 fixture 값을 받아 그린다.
 */
export function DashboardKpiGrid({ kpi }: { kpi: DashboardKpi }) {
  return (
    <div className="grid grid-cols-4 gap-5">
      <FgKpiCard
        footer={`총 금액 ${formatCurrency(kpi.activePoAmount)}`}
        icon={<ShoppingCart aria-hidden className="h-4 w-4" />}
        label="진행 중 구매 PO"
        metric={formatNumber(kpi.activePoCount)}
      />
      <FgKpiCard
        icon={<Truck aria-hidden className="h-4 w-4" />}
        label="도착 예정 PO"
        metric={<span className="text-warning">{formatNumber(kpi.arrivingPoCount)}</span>}
        tag={<FgBadge variant="danger">지연 {kpi.delayedPoCount}건</FgBadge>}
        tone="warning"
      />
      <FgKpiCard
        footer={`평균 대기 ${kpi.avgApprovalWaitHours}시간`}
        icon={<ClipboardCheck aria-hidden className="h-4 w-4" />}
        label="승인 대기 발주"
        metric={formatNumber(kpi.pendingApprovalCount)}
      />
      <FgKpiCard
        footer="전 지점 합계"
        icon={<Truck aria-hidden className="h-4 w-4" />}
        label="출고 대기 발주"
        metric={formatNumber(kpi.pendingShipCount)}
      />
    </div>
  )
}
