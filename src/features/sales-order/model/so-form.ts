// =============================================================================
// SO 생성/수정 폼 공용 data 로직
//
// 생성 페이지와 수정 페이지가 동일한 폼 본문(SoForm)·변환 로직을 공유한다.
// =============================================================================

import type { SoLine } from './ui-types'
import type { SoFormValues } from './so-draft-schema'
import type { SalesOrderDetailResponse, SalesOrderLineRequest } from './types'

export const defaultSoFormValues: SoFormValues = {
  memo: '',
  warehouseCode: '',
}

/** SoLine[] → 백엔드 요청 라인 (부품 미선택 라인 제외) */
export function linesToRequest(lines: SoLine[]): SalesOrderLineRequest[] {
  return lines
    .filter((line): line is SoLine & { itemCode: string } => line.itemCode !== null)
    .map((line) => ({
      itemCode: line.itemCode,
      priority: line.priority,
      quantity: line.quantity,
    }))
}

/** 발주 상세 응답 → 폼 기본값 (수정 prefill 용) */
export function detailToFormValues(detail: SalesOrderDetailResponse): SoFormValues {
  return {
    memo: detail.requestMemo ?? '',
    // 입고 창고(요청 시 warehouseCode) = toWarehouse (요청 수신 = 본사 창고).
    warehouseCode: detail.toWarehouse.code,
  }
}

/**
 * 발주 상세 응답 → 폼 입력 라인 (수정 prefill 용).
 * DRAFT 라인은 itemName·unit 이 null 일 수 있어 수정 페이지에서 batch 로 보강한다.
 * 상세 응답에는 우선순위가 없어 NORMAL 로 초기화한다(편집 시 사용자가 재지정).
 */
export function detailToDraftLines(detail: SalesOrderDetailResponse): SoLine[] {
  return detail.lines.map((line) => ({
    branchStock: null,
    itemCode: line.itemCode,
    itemName: line.itemName ?? '',
    priority: 'NORMAL',
    quantity: line.requestQuantity,
    safetyStock: null,
    unit: line.unit,
  }))
}
