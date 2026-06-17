import { formatDateTime } from '@/shared/lib/format'

import { SO_STATUS_LABELS } from './so-ui-model'
import type { PersonInfo, SalesOrderHistoryResponse, SalesOrderStatus } from './types'

// 변경 이력 화면 행 (SO #15). 라벨을 미리 계산해 둔다.
export interface SalesOrderHistoryRow {
  changedAt: string
  changedAtLabel: string
  changedBy: PersonInfo | null
  changedByLabel: string
  status: SalesOrderStatus
  statusLabel: string
}

function formatChangedBy(person: PersonInfo | null): string {
  if (!person) return '시스템'
  return person.position ? `${person.name} · ${person.position}` : person.name
}

export function mapSalesOrderHistory(history: SalesOrderHistoryResponse): SalesOrderHistoryRow {
  return {
    changedAt: history.changedAt,
    changedAtLabel: formatDateTime(history.changedAt),
    changedBy: history.changedBy,
    changedByLabel: formatChangedBy(history.changedBy),
    status: history.status,
    statusLabel: SO_STATUS_LABELS[history.status],
  }
}
