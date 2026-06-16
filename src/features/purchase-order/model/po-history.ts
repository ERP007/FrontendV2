import { formatDateTime } from '@/shared/lib/format'

import { PO_STATUS_LABELS } from './po-list-row'
import type {
  PersonInfo,
  PurchaseOrderHistoryResponse,
  PurchaseOrderStatus,
} from './types'

export interface PurchaseOrderHistoryRow {
  changedAt: string
  changedAtLabel: string
  changedBy: PersonInfo | null
  changedByLabel: string
  status: PurchaseOrderStatus
  statusLabel: string
}

function formatChangedBy(person: PersonInfo | null): string {
  if (!person) return '시스템'
  return person.position ? `${person.name} · ${person.position}` : person.name
}

export function mapPurchaseOrderHistory(
  history: PurchaseOrderHistoryResponse,
): PurchaseOrderHistoryRow {
  return {
    changedAt: history.changedAt,
    changedAtLabel: formatDateTime(history.changedAt),
    changedBy: history.changedBy,
    changedByLabel: formatChangedBy(history.changedBy),
    status: history.status,
    statusLabel: PO_STATUS_LABELS[history.status],
  }
}
