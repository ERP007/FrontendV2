import { ClipboardList, ShoppingCart, Truck } from 'lucide-react'

import { formatNumber } from '@/shared/lib/format'
import { FgKpiCard } from '@/shared/ui'

import type { PurchaseOrderKpiResponse } from '../model/types'

export type PoKpiFilter = 'all' | 'draft' | 'approved'

export interface PoKpiCardsProps {
  kpi: PurchaseOrderKpiResponse
  onSelect?: (filter: PoKpiFilter) => void
}

export function PoKpiCards({ kpi, onSelect }: PoKpiCardsProps) {
  const hasDrafts = kpi.draftCount > 0
  const clickable = 'cursor-pointer transition-colors hover:border-primary'

  return (
    <div className="grid grid-cols-3 gap-5">
      <FgKpiCard
        className={onSelect ? clickable : undefined}
        icon={<ShoppingCart aria-hidden className="h-4 w-4" />}
        label="전체 PO"
        metric={formatNumber(kpi.totalCount)}
        onClick={() => onSelect?.('all')}
      />
      <FgKpiCard
        className={onSelect ? clickable : undefined}
        icon={<ClipboardList aria-hidden className="h-4 w-4" />}
        label="승인 대기"
        metric={formatNumber(kpi.draftCount)}
        tone={hasDrafts ? 'primary' : 'default'}
        onClick={() => onSelect?.('draft')}
      />
      <FgKpiCard
        className={onSelect ? clickable : undefined}
        icon={<Truck aria-hidden className="h-4 w-4" />}
        label="도착 예정"
        metric={formatNumber(kpi.approvedCount)}
        onClick={() => onSelect?.('approved')}
      />
    </div>
  )
}
