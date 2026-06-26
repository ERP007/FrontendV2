import { ArrowDownToLine, ArrowUpFromLine, RefreshCcw } from 'lucide-react'

import { FgBadge } from '@/shared/ui'

import { STOCK_STATUS_LABELS } from '../model/types'

import type { MovementType, StockStatus } from '../model/types'

const stockStatusVariants: Record<StockStatus, 'success' | 'warning'> = {
  LOW: 'warning',
  NORMAL: 'success',
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  return (
    <FgBadge dot variant={stockStatusVariants[status]}>
      {STOCK_STATUS_LABELS[status]}
    </FgBadge>
  )
}

/** 이력 화면 표기용 3분류 배지 — 입고(navy) / 출고(outline) / 조정(warning) */
export function MovementTypeBadge({ type }: { type: MovementType }) {
  if (type === 'INBOUND') {
    return (
      <FgBadge icon={<ArrowDownToLine aria-hidden className="h-3 w-3" />} variant="navy">
        입고
      </FgBadge>
    )
  }

  if (type === 'OUTBOUND') {
    return (
      <FgBadge icon={<ArrowUpFromLine aria-hidden className="h-3 w-3" />} variant="outline">
        출고
      </FgBadge>
    )
  }

  return (
    <FgBadge icon={<RefreshCcw aria-hidden className="h-3 w-3" />} variant="warning">
      조정
    </FgBadge>
  )
}
