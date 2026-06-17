// =============================================================================
// PO 생성/수정 폼 공용 data 로직
//
// 생성 페이지와 수정 페이지가 동일한 폼 본문(PoForm)·검증·변환 로직을 공유한다.
// =============================================================================

import type { PoDraftLine } from './ui-types'
import type { PurchaseOrderDraftFormValues } from './po-schema'
import type {
  PurchaseOrderDetailLine,
  PurchaseOrderDetailResponse,
  PurchaseOrderLineRequest,
} from './types'

export const defaultPurchaseOrderFormValues: PurchaseOrderDraftFormValues = {
  desiredArrivalDate: '',
  memo: '',
  vendorCode: '',
  warehouseCode: '',
}

/** PoDraftLine[] → 백엔드 요청 라인 (부품 미선택 라인 제외) */
export function linesToRequest(lines: PoDraftLine[]): PurchaseOrderLineRequest[] {
  return lines
    .filter((line): line is PoDraftLine & { sku: string } => line.sku !== null)
    .map((line) => ({
      itemSku: line.sku,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    }))
}

/** 라인 값 검증. 문제 없으면 null, 있으면 사용자 메시지 반환 */
export function validateLineValues(lines: PurchaseOrderLineRequest[]): string | null {
  if (lines.some((line) => line.quantity < 1)) {
    return '모든 품목의 수량을 1 이상으로 입력하세요.'
  }
  if (lines.some((line) => line.unitPrice < 0)) {
    return '모든 품목의 단가를 0 이상으로 입력하세요.'
  }
  return null
}

function detailLineToDraft(line: PurchaseOrderDetailLine): PoDraftLine {
  return {
    // DRAFT 라인은 name·unit 이 null 일 수 있다.
    itemName: line.name ?? '',
    quantity: line.quantity,
    sku: line.sku,
    unit: line.unit,
    unitPrice: line.unitPrice,
  }
}

/** 상세 응답 → 폼 입력 라인 (수정 prefill 용) */
export function detailToDraftLines(detail: PurchaseOrderDetailResponse): PoDraftLine[] {
  return detail.lines.map(detailLineToDraft)
}

/** 상세 응답 → 폼 기본값 (수정 prefill 용) */
export function detailToFormValues(
  detail: PurchaseOrderDetailResponse,
): PurchaseOrderDraftFormValues {
  return {
    desiredArrivalDate: detail.desiredArrivalDate.slice(0, 10),
    memo: detail.memo ?? '',
    vendorCode: detail.vendor.code,
    warehouseCode: detail.warehouse.code,
  }
}
