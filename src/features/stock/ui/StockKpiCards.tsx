import { AlertTriangle, Boxes, History, PackageX } from 'lucide-react'

import { formatNumber } from '@/shared/lib/format'
import { FgBadge, FgKpiCard } from '@/shared/ui'

import type { StockKpi } from '../model/types'

export function StockKpiCards({ kpi }: { kpi: StockKpi }) {
  return (
    <div className="grid grid-cols-4 gap-5">
      <FgKpiCard
        footer="부품 × 창고 재고 포지션"
        icon={<Boxes aria-hidden className="h-4 w-4" />}
        label="총 SKU"
        metric={formatNumber(kpi.totalSkuCount)}
      />
      <FgKpiCard
        icon={<AlertTriangle aria-hidden className="h-4 w-4" />}
        label="부족 재고"
        metric={<span className="text-warning">{formatNumber(kpi.lowStockCount)}</span>}
        tag={<FgBadge variant="warning">안전재고 미만</FgBadge>}
        tone="warning"
      />
      <FgKpiCard
        icon={<PackageX aria-hidden className="h-4 w-4" />}
        label="재고 없음"
        metric={formatNumber(kpi.noStockCount)}
        tag={<FgBadge variant="danger">발주 시급</FgBadge>}
      />
      <FgKpiCard
        footer="증가 · 감소 · 실사 보정 기준"
        icon={<History aria-hidden className="h-4 w-4" />}
        label="최근 7일 조정"
        metric={formatNumber(kpi.recentAdjustCount)}
      />
    </div>
  )
}
