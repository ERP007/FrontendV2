import { AlertTriangle, ClipboardList, ShoppingCart, Truck } from 'lucide-react'

import { formatNumber } from '@/shared/lib/format'
import { FgBadge, FgKpiCard } from '@/shared/ui'

import type { PoKpi } from '../model/filter-purchase-orders'

export function PoKpiCards({ kpi }: { kpi: PoKpi }) {
  return (
    <div className="grid grid-cols-4 gap-5">
      <FgKpiCard
        footer="최근 30일 기준"
        icon={<ShoppingCart aria-hidden className="h-4 w-4" />}
        label="전체 PO"
        metric={formatNumber(kpi.totalCount)}
      />
      <FgKpiCard
        footer="DRAFT — 확정 전"
        icon={<ClipboardList aria-hidden className="h-4 w-4" />}
        label="승인 대기"
        metric={formatNumber(kpi.draftCount)}
      />
      <FgKpiCard
        footer="확정 · 출고 진행 중"
        icon={<Truck aria-hidden className="h-4 w-4" />}
        label="도착 예정"
        metric={formatNumber(kpi.arrivingCount)}
      />
      <FgKpiCard
        icon={<AlertTriangle aria-hidden className="h-4 w-4" />}
        label="지연"
        metric={<span className="text-danger">{formatNumber(kpi.delayedCount)}</span>}
        tag={<FgBadge variant="danger">예정일 초과</FgBadge>}
        tone="warning"
      />
    </div>
  )
}
