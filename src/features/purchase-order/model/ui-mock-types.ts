// =============================================================================
// UI 표시용 임시 타입/헬퍼 (백엔드 연동 전 mock 데이터 렌더링 전용)
//
// 실제 백엔드 request/response 타입은 `./types.ts` 에 정의되어 있다.
// 백엔드 연동 완료 후 이 파일은 제거 대상이다.
// =============================================================================

export type PoUiStatus = 'DRAFT' | 'APPROVED' | 'SHIPPED' | 'RECEIVED' | 'CANCELED'
export type PurchaseOrderEventType = PoUiStatus | 'EDITED'

export interface PurchaseOrderLine {
  amount: number
  itemName: string
  lineNo: number
  quantity: number
  sku: string
  unit: string
  unitPrice: number
}

export interface PurchaseOrderEvent {
  actorName: string
  actorTeam: string
  description: string
  id: number
  occurredAt: string
  type: PurchaseOrderEventType
}

export interface PurchaseOrder {
  confirmedBy: string | null
  confirmedTeam: string | null
  createdAt: string
  events: PurchaseOrderEvent[]
  expectedAt: string | null
  id: number
  lines: PurchaseOrderLine[]
  note: string | null
  paymentTerm: string
  poNo: string
  status: PoUiStatus
  supplierCode: string
  supplierName: string
  updatedAt: string
  warehouseCode: string
  warehouseName: string
}

export function poTotalQuantity(lines: Pick<PurchaseOrderLine, 'quantity'>[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function poTotalAmount(lines: Pick<PurchaseOrderLine, 'amount'>[]): number {
  return lines.reduce((sum, line) => sum + line.amount, 0)
}
