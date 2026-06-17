// =============================================================================
// Sales 화면 표현용 모델 (레거시 mock 기반)
//
// 백엔드 DTO 가 아닌, UI 컴포넌트·fixtures 가 쓰는 화면 모델·라벨·헬퍼.
// DTO 정합은 ./types 에 있다. enum 은 ./types 에서 재노출한다.
// =============================================================================

import type { CarrierType, SalesOrderStatus } from './types'

export type { CarrierType, SalesOrderStatus } from './types'

export type SoEventType = SalesOrderStatus | 'EDITED' | 'DRAFT'
export type SoItemUnit = string
export type SoPriority = 'NORMAL' | 'URGENT'

export const CARRIER_TYPE_LABELS: Record<CarrierType, string> = {
  DELIVERY_SERVICE: '택배',
  OTHER: '기타',
  VEHICLE: '차량',
}

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

export const SO_BRANCH_STATUS_ORDER: SalesOrderStatus[] = [
  'DRAFT',
  'REQUESTED',
  'APPROVED',
  'DELIVERED',
  'CANCELED',
  'REJECTED',
]

export const SO_STATUS_LABELS: Record<SalesOrderStatus, string> = {
  DRAFT: '임시저장',
  REQUESTED: '출고 대기',
  APPROVED: '도착 대기',
  DELIVERED: '입고',
  CANCELED: '취소',
  REJECTED: '거절',
}

export const SO_TAB_STATUS_MAP: Record<SoStatusTab, SalesOrderStatus[] | undefined> = {
  ALL: undefined,
  CLOSED: ['REJECTED', 'CANCELED'],
  DONE: ['DELIVERED'],
  IN_PROGRESS: ['REQUESTED', 'APPROVED'],
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

/** SO-04 상태 탭 */
export type SoStatusTab = 'ALL' | 'IN_PROGRESS' | 'DONE' | 'CLOSED'

export const IN_PROGRESS_STATUSES: SalesOrderStatus[] = ['REQUESTED', 'APPROVED']

/** SO-05 작성 중 라인 */
export interface SoLine {
  branchStock: number | null
  itemCode: string | null
  itemName: string
  priority: SoPriority
  quantity: number
  safetyStock: number | null
  unit: SoItemUnit | null
}

export function emptySoDraftLine(): SoLine {
  return {
    branchStock: null,
    itemCode: null,
    itemName: '',
    priority: 'NORMAL',
    quantity: 0,
    safetyStock: null,
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
