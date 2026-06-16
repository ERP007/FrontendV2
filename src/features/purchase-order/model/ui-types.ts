// =============================================================================
// 영구 UI 타입 (PO 생성 폼의 작성 중 라인 표현 등)
//
// 백엔드 연동 후에도 유지되는 폼 입력 전용 모델.
// =============================================================================

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
