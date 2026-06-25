import { formatDate, formatDateTime } from '@/shared/lib/format'

import {
  CARRIER_TYPE_LABELS,
  REJECT_REASON_CATEGORY_LABELS,
  SO_STATUS_LABELS,
} from './ui-types'
import type {
  CarrierType,
  PersonInfo,
  RejectReasonCategory,
  SalesOrderHistoryResponse,
  SalesOrderStatus,
  StatusChangeMeta,
} from './types'

// 변경 이력 화면 행 (SO #16). 라벨을 미리 계산해 둔다.
export interface SalesOrderHistoryRow {
  changedAt: string
  changedAtLabel: string
  changedBy: PersonInfo | null
  changedByLabel: string
  metaLines: string[] // 상태별 부가정보(승인/거절/입고/취소). 없으면 빈 배열.
  status: SalesOrderStatus
  statusLabel: string
}

function formatChangedBy(person: PersonInfo | null): string {
  if (!person) return '시스템'
  return person.position ? `${person.name} · ${person.position}` : person.name
}

function carrierLabel(value: string | null): string {
  if (!value) return '—'
  return CARRIER_TYPE_LABELS[value as CarrierType] ?? value
}

function reasonCategoryLabel(value: string | null): string {
  if (!value) return '—'
  return REJECT_REASON_CATEGORY_LABELS[value as RejectReasonCategory] ?? value
}

function metaToLines(meta: StatusChangeMeta | null): string[] {
  if (!meta) return []
  switch (meta.type) {
    case 'APPROVED':
      return [
        `출고 일자 · ${formatDate(meta.approvedDate)}`,
        `운송 수단 · ${carrierLabel(meta.carrierType)}`,
        ...(meta.invoiceNumber ? [`송장번호 · ${meta.invoiceNumber}`] : []),
      ]
    case 'REJECTED':
      return [
        `사유 · ${reasonCategoryLabel(meta.reasonCategory)}`,
        ...(meta.reasonMemo ? [`메모 · ${meta.reasonMemo}`] : []),
      ]
    case 'DELIVERED':
      return [`입고 일자 · ${formatDate(meta.deliveredDate)}`]
    case 'CANCELED':
      return [`사유 · ${meta.reason}`]
    default:
      return []
  }
}

export function mapSalesOrderHistory(history: SalesOrderHistoryResponse): SalesOrderHistoryRow {
  return {
    changedAt: history.changedAt,
    changedAtLabel: formatDateTime(history.changedAt),
    changedBy: history.changedBy,
    changedByLabel: formatChangedBy(history.changedBy),
    metaLines: metaToLines(history.meta),
    status: history.status,
    statusLabel: SO_STATUS_LABELS[history.status],
  }
}
