import { formatDateTime } from '@/shared/lib/format'

import type { FgDomainStatus } from '@/shared/ui'

import { ORDER_PROGRESS_BADGE_STATUS, ORDER_PROGRESS_LABELS, SO_STATUS_LABELS } from './ui-types'
import type {
  PersonInfo,
  SalesOrderDetailResponse,
  SalesOrderLineResponse,
} from './types'

function personLabel(person: PersonInfo | null): string {
  if (!person) return '—'
  return person.position ? `${person.name} · ${person.position}` : person.name
}

// 라인 화면 모델. 단위 미확정이면 '—' 로 표시한다.
export interface SalesOrderDetailLine extends Omit<SalesOrderLineResponse, 'unit'> {
  unit: string
}

// 발주 상세 화면 모델 (SO #13, 지점/본사 공통). 표시용 라벨을 미리 계산해 둔다.
export interface SalesOrderDetail extends Omit<SalesOrderDetailResponse, 'lines'> {
  approvalLabel: string | null // 미승인이면 null
  lines: SalesOrderDetailLine[]
  progressBadgeStatus: FgDomainStatus
  requestedAtLabel: string
  requesterLabel: string
  requesterName: string
  requesterPosition: string | null
  statusLabel: string
  progressLabel: string
}

function mapLine(line: SalesOrderLineResponse): SalesOrderDetailLine {
  return {
    ...line,
    unit: line.unit ?? '—',
  }
}

export function mapSalesOrderDetail(detail: SalesOrderDetailResponse): SalesOrderDetail {
  return {
    ...detail,
    approvalLabel: detail.approval ? personLabel(detail.approval) : null,
    lines: detail.lines.map(mapLine),
    progressBadgeStatus: ORDER_PROGRESS_BADGE_STATUS[detail.progress],
    requestedAtLabel: detail.requestedAt ? formatDateTime(detail.requestedAt) : '—',
    requesterLabel: personLabel(detail.requester),
    requesterName: detail.requester?.name ?? '—',
    requesterPosition: detail.requester?.position ?? null,
    statusLabel: SO_STATUS_LABELS[detail.status],
    progressLabel: ORDER_PROGRESS_LABELS[detail.progress],
  }
}
