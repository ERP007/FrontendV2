// =============================================================================
// 영구 UI 타입 (PO 생성 폼의 작성 중 라인 표현 등)
//
// 백엔드 연동 후에도 유지되는 폼 입력 전용 모델.
// =============================================================================

import type { FgDomainStatus } from '@/shared/ui'

import type { PurchaseOrderProgress } from './types'

/** 진행 상태(PurchaseOrderProgress) 화면 라벨. UI 는 라벨 매핑만 담당한다. */
export const PO_PROGRESS_LABELS: Record<PurchaseOrderProgress, string> = {
  DRAFT: '작성 중',
  APPROVED: '승인 확정',
  INBOUND_IN_PROGRESS: '입고 처리중',
  RECEIVED: '입고 완료',
  INBOUND_FAILED: '입고 실패',
  CANCELED: '취소',
}

/** PurchaseOrderProgress → 상태 배지 색/아이콘(FgDomainStatus) 매핑. */
export const PO_PROGRESS_BADGE_STATUS: Record<PurchaseOrderProgress, FgDomainStatus> = {
  DRAFT: 'DRAFT',
  APPROVED: 'APPROVED',
  INBOUND_IN_PROGRESS: 'SHIPPED',
  RECEIVED: 'RECEIVED',
  INBOUND_FAILED: 'REJECTED',
  CANCELED: 'CANCELED',
}

export interface PoDraftLine {
  itemName: string
  quantity: number
  sku: string | null
  unit: string | null
  unitPrice: number
}

export function emptyDraftLine(): PoDraftLine {
  return { itemName: '', quantity: 0, sku: null, unit: null, unitPrice: 0 }
}

export function draftLineAmount(line: PoDraftLine): number {
  return line.quantity * line.unitPrice
}
