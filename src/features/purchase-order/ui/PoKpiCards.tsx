import { ClipboardList, ShoppingCart, Truck } from 'lucide-react'

import { formatNumber } from '@/shared/lib/format'
import { FgKpiCard } from '@/shared/ui'

import type { PurchaseOrderKpiResponse } from '../model/types'

export type PoKpiFilter = 'all' | 'draft' | 'approved'

export interface PoKpiCardsProps {
  kpi: PurchaseOrderKpiResponse
  /** 라벨 앞에 붙일 접두어(예: 대시보드에서 '구매 '). 현황 페이지에선 생략. */
  labelPrefix?: string
  onSelect?: (filter: PoKpiFilter) => void
}

export function PoKpiCards({ kpi, labelPrefix = '', onSelect }: PoKpiCardsProps) {
  const hasDrafts = kpi.draftCount > 0
  const clickable = 'cursor-pointer transition-colors hover:border-primary'

  return (
    <div className="grid grid-cols-3 gap-5">
      <FgKpiCard
        className={onSelect ? clickable : undefined}
        icon={<ShoppingCart aria-hidden className="h-4 w-4" />}
        label={`${labelPrefix}전체 요청`}
        metric={formatNumber(kpi.totalCount)}
        onClick={() => onSelect?.('all')}
      />
      <FgKpiCard
        className={onSelect ? clickable : undefined}
        icon={<ClipboardList aria-hidden className="h-4 w-4" />}
        label={`${labelPrefix}임시저장`}
        metric={formatNumber(kpi.draftCount)}
        tone={hasDrafts ? 'primary' : 'default'}
        onClick={() => onSelect?.('draft')}
      />
      <FgKpiCard
        className={onSelect ? clickable : undefined}
        icon={<Truck aria-hidden className="h-4 w-4" />}
        label={`${labelPrefix}입고 대기`}
        metric={formatNumber(kpi.approvedCount)}
        onClick={() => onSelect?.('approved')}
      />
    </div>
  )
}
