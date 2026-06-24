// =============================================================================
// Sales 화면 표현용 모델 (라벨·작성 폼 라인·파생 헬퍼)
//
// 백엔드 DTO 가 아닌, UI 가 쓰는 라벨·작성 라인·상태 헬퍼. DTO 정합은 ./types.
// enum 은 ./types 에서 재노출한다.
// =============================================================================

import type { FgDomainStatus } from '@/shared/ui'

import type {
  CarrierType,
  OrderProgress,
  Priority,
  RejectReasonCategory,
  SalesOrderStatus,
} from './types'

export type { OrderProgress, Priority, SalesOrderStatus } from './types'

export const CARRIER_TYPE_LABELS: Record<CarrierType, string> = {
  DELIVERY_SERVICE: '택배',
  OTHER: '기타',
  VEHICLE: '차량',
}

/** 진행 상태(OrderProgress) 화면 라벨. UI 는 라벨 매핑만 담당한다. */
export const ORDER_PROGRESS_LABELS: Record<OrderProgress, string> = {
  DRAFT: '임시저장',
  REQUESTED: '출고 대기',
  OUTBOUND_IN_PROGRESS: '출고 처리중',
  APPROVED: '도착 대기',
  OUTBOUND_FAILED: '출고 실패',
  INBOUND_IN_PROGRESS: '입고 처리중',
  DELIVERED: '입고 완료',
  INBOUND_FAILED: '입고 실패',
  REJECTED: '거절',
  CANCELED: '취소',
}

/** OrderProgress → 상태 배지 색/아이콘(FgDomainStatus) 매핑. 라벨은 ORDER_PROGRESS_LABELS. */
export const ORDER_PROGRESS_BADGE_STATUS: Record<OrderProgress, FgDomainStatus> = {
  DRAFT: 'DRAFT',
  REQUESTED: 'REQUESTED',
  OUTBOUND_IN_PROGRESS: 'SHIPPED',
  APPROVED: 'APPROVED',
  OUTBOUND_FAILED: 'REJECTED',
  INBOUND_IN_PROGRESS: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  INBOUND_FAILED: 'REJECTED',
  REJECTED: 'REJECTED',
  CANCELED: 'CANCELED',
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
