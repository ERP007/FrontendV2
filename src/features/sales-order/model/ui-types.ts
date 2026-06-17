// =============================================================================
// Sales 화면 표현용 모델 (라벨·작성 폼 라인·파생 헬퍼)
//
// 백엔드 DTO 가 아닌, UI 가 쓰는 라벨·작성 라인·상태 헬퍼. DTO 정합은 ./types.
// enum 은 ./types 에서 재노출한다.
// =============================================================================

import type { CarrierType, Priority, RejectReasonCategory, SalesOrderStatus } from './types'

export type { Priority, SalesOrderStatus } from './types'

export const CARRIER_TYPE_LABELS: Record<CarrierType, string> = {
  DELIVERY_SERVICE: '택배',
  OTHER: '기타',
  VEHICLE: '차량',
}

export const REJECT_REASON_CATEGORY_LABELS: Record<RejectReasonCategory, string> = {
  DUPLICATE: '중복 요청',
  OTHER: '기타',
  OUT_OF_STOCK: '재고 부족',
  POLICY: '정책 위반',
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

export const SO_PRIORITY_LABELS: Record<Priority, string> = {
  NORMAL: '일반',
  URGENT: '긴급',
}

/** SO-04 상태 탭 */
export type SoStatusTab = 'ALL' | 'IN_PROGRESS' | 'DONE' | 'CLOSED'

export const IN_PROGRESS_STATUSES: SalesOrderStatus[] = ['REQUESTED', 'APPROVED']

/** 작성 중 발주 라인 (생성·수정 폼) */
export interface SoLine {
  branchStock: number | null
  itemCode: string | null
  itemName: string
  priority: Priority
  quantity: number
  safetyStock: number | null
  unit: string | null
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

/** 진행 중 발주의 도착 희망일이 오늘보다 과거면 지연. (완료/취소/거절 제외) */
export function isSoDelayed(
  so: { desiredAt: string; status: SalesOrderStatus },
  today: string,
): boolean {
  if (so.status === 'DELIVERED' || so.status === 'CANCELED' || so.status === 'REJECTED') return false
  return so.desiredAt < today
}
