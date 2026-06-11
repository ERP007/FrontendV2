import { AlertTriangle, Boxes, ClipboardCheck, History, PackageX, ShoppingCart, Truck } from 'lucide-react'

import { formatCurrency, formatNumber } from '@/shared/lib/format'
import { FgBadge, FgKpiCard } from '@/shared/ui'

import type { DashboardKpi } from '../model/types'

export function DashboardKpiGrid({ kpi }: { kpi: DashboardKpi }) {
  return (
    <div className="grid grid-cols-4 gap-5">
      <FgKpiCard
        footer="활성 부품 기준"
        icon={<Boxes aria-hidden className="h-4 w-4" />}
        label="총 SKU"
        metric={formatNumber(kpi.totalSkuCount)}
      />
      <FgKpiCard
        footer="안전재고 미만"
        icon={<AlertTriangle aria-hidden className="h-4 w-4" />}
        label="부족 재고"
        metric={<span className="text-warning">{formatNumber(kpi.lowStockCount)}</span>}
        tone="warning"
      />
      <FgKpiCard
        footer="SKU"
        icon={<PackageX aria-hidden className="h-4 w-4" />}
        label="무재고"
        metric={formatNumber(kpi.noStockCount)}
      />
      <FgKpiCard
        footer={`전주 대비 ${kpi.adjustDelta >= 0 ? '+' : ''}${formatNumber(kpi.adjustDelta)}`}
        icon={<History aria-hidden className="h-4 w-4" />}
        label="최근 7일 조정"
        metric={formatNumber(kpi.recentAdjustCount)}
      />
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
