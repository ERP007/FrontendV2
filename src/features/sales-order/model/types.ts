/**
 * Sales 서비스 swagger 미수신 — HANDOFF §12(SO-01~06) 기반 UI 모델.
 * swagger 수신 시 필드명을 응답 스키마와 정합시킨다.
 */
export type SalesOrderStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED'
export type SoEventType = SalesOrderStatus | 'EDITED' | 'DRAFT'
export type SoItemUnit = 'EA' | 'BOX' | 'SET' | 'L'
export type SoPriority = 'NORMAL' | 'URGENT'

export interface SalesOrderLine {
  /** 본사 출고 창고 가용 재고 (검토 시점) */
  availableStock: number
  approvedQuantity: number | null
  deliveredQuantity: number | null
  itemName: string
  lineNo: number
  priority: SoPriority
  requestedQuantity: number
  shippedQuantity: number | null
  sku: string
  unit: SoItemUnit
}

export interface SalesOrderEvent {
  actorName: string
  actorOrg: string
  description: string
  id: number
  occurredAt: string
  type: SoEventType
}

export interface SalesOrder {
  approvedAt: string | null
  approverName: string | null
  branchCode: string
  branchName: string
  branchRegion: string
  desiredAt: string
  events: SalesOrderEvent[]
  id: number
  invoiceNo: string | null
  lines: SalesOrderLine[]
  note: string | null
  receiveWarehouseCode: string
  receiveWarehouseName: string
  rejectReason: string | null
  reqNo: string
  requestedAt: string
  requesterName: string
  requesterRole: string
  shipWarehouseCode: string | null
  shipWarehouseName: string | null
  shippedAt: string | null
  status: SalesOrderStatus
  transport: string | null
}

export const SO_STATUS_LABELS: Record<SalesOrderStatus, string> = {
  APPROVED: 'APPROVED',
  CANCELED: 'CANCELED',
  DELIVERED: 'DELIVERED',
  REJECTED: 'REJECTED',
  REQUESTED: 'REQUESTED',
  SHIPPED: 'SHIPPED',
}

export const SO_PRIORITY_LABELS: Record<SoPriority, string> = {
  NORMAL: '일반',
  URGENT: '긴급',
}

export const TRANSPORT_OPTIONS = [
  '자사 차량 (대형 1톤)',
  '자사 차량 (소형)',
  '택배',
  '용차',
] as const

export const REJECT_REASON_OPTIONS = [
  '재고 부족',
  '요청 수량 과다',
  '중복 요청',
  '단종 부품',
  '예산 초과',
  '기타',
] as const

export const ARRIVAL_DIFF_REASON_OPTIONS = [
  '배송 누락',
  '파손',
  '오배송',
  '수량 오류',
  '기타',
] as const

export interface SalesOrderFilter {
  branchCode: 'ALL' | string
  from: string
  keyword: string
  status: 'ALL' | SalesOrderStatus
  to: string
}

/** SO-04 상태 탭 */
export type SoStatusTab = 'ALL' | 'IN_PROGRESS' | 'DONE' | 'CLOSED'

export const IN_PROGRESS_STATUSES: SalesOrderStatus[] = ['REQUESTED', 'APPROVED', 'SHIPPED']

/** SO-05 작성 중 라인 */
export interface SoDraftLine {
  branchStock: number | null
  itemName: string
  priority: SoPriority
  quantity: number
  safetySource: 'MASTER' | 'OVERRIDE' | null
  safetyStock: number | null
  sku: string | null
  unit: SoItemUnit | null
}

export function emptySoDraftLine(): SoDraftLine {
  return {
    branchStock: null,
    itemName: '',
    priority: 'NORMAL',
    quantity: 0,
    safetySource: null,
    safetyStock: null,
    sku: null,
    unit: null,
  }
}

export function soTotalRequested(lines: Pick<SalesOrderLine, 'requestedQuantity'>[]): number {
  return lines.reduce((sum, line) => sum + line.requestedQuantity, 0)
}

export function soTotalApproved(lines: Pick<SalesOrderLine, 'approvedQuantity'>[]): number {
  return lines.reduce((sum, line) => sum + (line.approvedQuantity ?? 0), 0)
}

/** 부족 합계: 요청 수량이 가용 재고를 초과하는 만큼의 음수 합 */
export function soShortageTotal(
  lines: Pick<SalesOrderLine, 'availableStock' | 'requestedQuantity'>[],
): number {
  return lines.reduce(
    (sum, line) => sum + Math.min(0, line.availableStock - line.requestedQuantity),
    0,
  )
}

export function soShortageCount(
  lines: Pick<SalesOrderLine, 'availableStock' | 'requestedQuantity'>[],
): number {
  return lines.filter((line) => line.requestedQuantity > line.availableStock).length
}

export function isSoDelayed(so: Pick<SalesOrder, 'desiredAt' | 'status'>, today: string): boolean {
  if (so.status === 'DELIVERED' || so.status === 'CANCELED' || so.status === 'REJECTED') return false
  return so.desiredAt < today
}
