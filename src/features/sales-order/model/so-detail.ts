import { formatDate, formatDateTime, formatDday } from '@/shared/lib/format'

import { SO_STATUS_LABELS } from './so-ui-model'
import type {
  BranchSalesOrderDetailResponse,
  HqSalesOrderDetailResponse,
  PersonInfo,
  SalesOrderLineResponse,
} from './types'

function personLabel(person: PersonInfo | null): string {
  if (!person) return '—'
  return person.position ? `${person.name} · ${person.position}` : person.name
}

// 라인 화면 모델. 단위 미확정이면 '—' 로 표시한다.
export interface BranchSalesOrderDetailLine extends Omit<SalesOrderLineResponse, 'unit'> {
  unit: string
}

// 지점 발주 상세 화면 모델 (SO #10). 상태 한글 라벨을 미리 계산해 둔다.
export interface BranchSalesOrderDetail
  extends Omit<BranchSalesOrderDetailResponse, 'lines'> {
  lines: BranchSalesOrderDetailLine[]
  statusLabel: string
}

function mapLine(line: SalesOrderLineResponse): BranchSalesOrderDetailLine {
  return {
    ...line,
    unit: line.unit ?? '—',
  }
}

export function mapBranchSalesOrderDetail(
  detail: BranchSalesOrderDetailResponse,
): BranchSalesOrderDetail {
  return {
    ...detail,
    lines: detail.lines.map(mapLine),
    statusLabel: SO_STATUS_LABELS[detail.status],
  }
}

// 본사 발주 상세 화면 모델 (SO #13). 표시용 라벨을 미리 계산해 둔다.
export interface HqSalesOrderDetail extends Omit<HqSalesOrderDetailResponse, 'lines'> {
  approvalLabel: string | null // 승인 전 null
  dday: string
  desiredArrivalDateLabel: string
  lines: BranchSalesOrderDetailLine[]
  requestedAtLabel: string
  requesterLabel: string
  statusLabel: string
}

export function mapHqSalesOrderDetail(detail: HqSalesOrderDetailResponse): HqSalesOrderDetail {
  return {
    ...detail,
    approvalLabel: detail.approval ? personLabel(detail.approval) : null,
    dday: formatDday(detail.desiredArrivalDate),
    desiredArrivalDateLabel: formatDate(detail.desiredArrivalDate),
    lines: detail.lines.map(mapLine),
    requestedAtLabel: detail.requestedAt ? formatDateTime(detail.requestedAt) : '—',
    requesterLabel: personLabel(detail.requester),
    statusLabel: SO_STATUS_LABELS[detail.status],
  }
}
