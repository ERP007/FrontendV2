import { formatDate, formatDateTime } from '@/shared/lib/format'

import { PO_STATUS_LABELS } from './po-list-row'
import type {
  PersonInfo,
  PurchaseOrderHistoryPayload,
  PurchaseOrderHistoryResponse,
  PurchaseOrderStatus,
} from './types'

export interface PurchaseOrderHistoryRow {
  changedAt: string
  changedAtLabel: string
  changedBy: PersonInfo | null
  changedByLabel: string
  metaLines: string[] // 입고일/취소사유 등 부가데이터. 없으면 빈 배열.
  status: PurchaseOrderStatus
  statusLabel: string
}

function formatChangedBy(person: PersonInfo | null): string {
  if (!person) return '시스템'
  return person.position ? `${person.name} · ${person.position}` : person.name
}

function payloadToLines(payload: PurchaseOrderHistoryPayload | null): string[] {
  if (!payload) return []
  const lines: string[] = []
  if (payload.receivedDate) lines.push(`입고 일자 · ${formatDate(payload.receivedDate)}`)
  if (payload.cancelReason) lines.push(`취소 사유 · ${payload.cancelReason}`)
  return lines
}

export function mapPurchaseOrderHistory(
  history: PurchaseOrderHistoryResponse,
): PurchaseOrderHistoryRow {
  return {
    changedAt: history.changedAt,
    changedAtLabel: formatDateTime(history.changedAt),
    changedBy: history.changedBy,
    changedByLabel: formatChangedBy(history.changedBy),
    metaLines: payloadToLines(history.payload),
    status: history.status,
    statusLabel: PO_STATUS_LABELS[history.status],
  }
}
