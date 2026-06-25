import type { FgDomainStatus } from '@/shared/ui'

import { PO_PROGRESS_BADGE_STATUS, PO_PROGRESS_LABELS } from './ui-types'
import type {
  PurchaseOrderProgress,
  PurchaseOrderStatus,
  PurchaseOrderSummaryResponse,
} from './types'

export interface PurchaseOrderRow {
  code: string
  createdAt: string
  lineCount: number
  progress: PurchaseOrderProgress
  progressBadgeStatus: FgDomainStatus
  progressLabel: string
  status: PurchaseOrderStatus
  statusLabel: string
  totalAmount: string
  vendorCode: string
  vendorName: string | null
}

export const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  APPROVED: '입고 대기',
  CANCELED: '취소',
  DRAFT: '임시저장',
  RECEIVED: '입고',
}

function formatTotalAmount(currency: string, amount: number): string {
  return `${currency} ${amount.toLocaleString('ko-KR')}`
}

export function mapPurchaseOrderSummary(
  summary: PurchaseOrderSummaryResponse,
): PurchaseOrderRow {
  return {
    code: summary.code,
    createdAt: summary.createdAt,
    lineCount: summary.lineCount,
    progress: summary.progress,
    progressBadgeStatus: PO_PROGRESS_BADGE_STATUS[summary.progress],
    progressLabel: PO_PROGRESS_LABELS[summary.progress],
    status: summary.status,
    statusLabel: PO_STATUS_LABELS[summary.status],
    totalAmount: formatTotalAmount(summary.currency, summary.totalAmount),
    vendorCode: summary.vendorCode,
    vendorName: summary.vendorName,
  }
}
