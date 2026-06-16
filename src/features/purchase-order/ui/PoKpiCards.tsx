import { AlertTriangle, ClipboardList, ShoppingCart, Truck } from 'lucide-react'

import { formatNumber } from '@/shared/lib/format'
import { FgBadge, FgKpiCard } from '@/shared/ui'

import type { PurchaseOrderKpiResponse } from '../model/types'

export function PoKpiCards({ kpi }: { kpi: PurchaseOrderKpiResponse }) {
  const hasDrafts = kpi.draftCount > 0
  const hasDelays = kpi.delayedCount > 0

  return (
    <div className="grid grid-cols-4 gap-5">
      <FgKpiCard
        icon={<ShoppingCart aria-hidden className="h-4 w-4" />}
        label="전체 PO"
        metric={formatNumber(kpi.totalCount)}
      />
      <FgKpiCard
        icon={<ClipboardList aria-hidden className="h-4 w-4" />}
        label="승인 대기"
        metric={formatNumber(kpi.draftCount)}
        tone={hasDrafts ? 'primary' : 'default'}
      />
      <FgKpiCard
        icon={<Truck aria-hidden className="h-4 w-4" />}
        label="도착 예정"
        metric={formatNumber(kpi.approvedCount)}
      />
      <FgKpiCard
        icon={<AlertTriangle aria-hidden className="h-4 w-4" />}
        label="지연"
        metric={
          hasDelays ? (
            <span className="text-danger">{formatNumber(kpi.delayedCount)}</span>
          ) : (
            formatNumber(kpi.delayedCount)
          )
        }
        tag={hasDelays ? <FgBadge variant="danger">예정일 초과</FgBadge> : undefined}
        tone={hasDelays ? 'warning' : 'default'}
      />
    </div>
  )
}
