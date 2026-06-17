import dayjs from 'dayjs'

import { formatDday, formatNumber } from '@/shared/lib/format'

import { IN_PROGRESS_STATUSES, isSoDelayed, SO_STATUS_LABELS } from './so-ui-model'
import type { BranchSalesOrderSummary, HqSalesOrderSummary, SalesOrderStatus } from './types'

// 단위 미확정(DRAFT 등)이면 '—', 아니면 "1,234 EA" 형태로 합쳐 표시한다.
function totalQuantityLabel(total: number, unit: string | null): string {
  return unit ? `${formatNumber(total)} ${unit}` : '—'
}

// =============================================================================
// 지점 목록 행 (SO #9)
// =============================================================================
export interface BranchSalesOrderRow {
  code: string
  dday: string
  delayed: boolean
  desiredArrivalDate: string
  inProgress: boolean
  itemCount: number
  requestedAt: string | null
  status: SalesOrderStatus
  statusLabel: string
  totalQuantity: string
}

export function mapBranchSalesOrderRow(summary: BranchSalesOrderSummary): BranchSalesOrderRow {
  const today = dayjs().format('YYYY-MM-DD')
  return {
    code: summary.code,
    dday: formatDday(summary.desiredArrivalDate),
    delayed: isSoDelayed(
      { desiredAt: summary.desiredArrivalDate, status: summary.status },
      today,
    ),
    desiredArrivalDate: summary.desiredArrivalDate,
    inProgress: IN_PROGRESS_STATUSES.includes(summary.status),
    itemCount: summary.itemCount,
    requestedAt: summary.requestedAt,
    status: summary.status,
    statusLabel: SO_STATUS_LABELS[summary.status],
    totalQuantity: totalQuantityLabel(summary.totalQuantity, summary.unitSnapshot),
  }
}

// =============================================================================
// 본사 목록 행 (SO #12)
// =============================================================================
export interface HqSalesOrderRow {
  code: string
  dday: string
  delayed: boolean
  desiredArrivalDate: string
  fromWarehouseCode: string
  itemCount: number
  requestedAt: string | null
  requesterName: string | null
  requesterPosition: string | null
  status: SalesOrderStatus
  statusLabel: string
  totalQuantity: string
}

export function mapHqSalesOrderRow(summary: HqSalesOrderSummary): HqSalesOrderRow {
  const today = dayjs().format('YYYY-MM-DD')
  return {
    code: summary.code,
    dday: formatDday(summary.desiredArrivalDate),
    delayed: isSoDelayed(
      { desiredAt: summary.desiredArrivalDate, status: summary.status },
      today,
    ),
    desiredArrivalDate: summary.desiredArrivalDate,
    fromWarehouseCode: summary.fromWarehouseCode,
    itemCount: summary.itemCount,
    requestedAt: summary.requestedAt,
    requesterName: summary.requesterName,
    requesterPosition: summary.requesterPosition,
    status: summary.status,
    statusLabel: SO_STATUS_LABELS[summary.status],
    totalQuantity: totalQuantityLabel(summary.totalQuantity, summary.unitSnapshot),
  }
}
