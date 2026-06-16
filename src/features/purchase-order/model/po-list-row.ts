import { formatDday, isOverdue } from '@/shared/lib/format'

import type { PurchaseOrderStatus, PurchaseOrderSummaryResponse } from './types'

export interface PurchaseOrderRow {
  code: string
  createdAt: string
  delayed: boolean
  dday: string
  desiredArrivalDate: string
  lineCount: number
  status: PurchaseOrderStatus
  statusLabel: string
  totalAmount: string
  totalQuantity: string
  vendorCode: string
  vendorName: string
}

export const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  APPROVED: '확정',
  CANCELED: '취소',
  DRAFT: '임시',
  RECEIVED: '입고',
}

const OPEN_STATUSES: ReadonlySet<PurchaseOrderStatus> = new Set(['DRAFT', 'APPROVED'])

function formatTotalQuantity(quantity: number | null, unit: string | null): string {
  if (quantity === null) return '—'
  return unit ? `${quantity.toLocaleString('ko-KR')} ${unit}` : quantity.toLocaleString('ko-KR')
}

function formatTotalAmount(currency: string, amount: number): string {
  return `${currency} ${amount.toLocaleString('ko-KR')}`
}

export function mapPurchaseOrderSummary(
  summary: PurchaseOrderSummaryResponse,
): PurchaseOrderRow {
  const isOpen = OPEN_STATUSES.has(summary.status)
  const delayed = isOpen && isOverdue(summary.desiredArrivalDate)

  return {
    code: summary.code,
    createdAt: summary.createdAt,
    delayed,
    dday: formatDday(summary.desiredArrivalDate),
    desiredArrivalDate: summary.desiredArrivalDate,
    lineCount: summary.lineCount,
    status: summary.status,
    statusLabel: PO_STATUS_LABELS[summary.status],
    totalAmount: formatTotalAmount(summary.currency, summary.totalAmount),
    totalQuantity: formatTotalQuantity(summary.totalQuantity, summary.unit),
    vendorCode: summary.vendorCode,
    vendorName: summary.vendorName,
  }
}
