/**
 * Procurement 서비스 swagger 미수신 — HANDOFF §11(PO-01~03) 기반 UI 모델.
 * swagger 수신 시 필드명을 응답 스키마와 정합시킨다.
 */
export type PurchaseOrderStatus = 'DRAFT' | 'APPROVED' | 'SHIPPED' | 'RECEIVED' | 'CANCELED'
export type PurchaseOrderEventType = PurchaseOrderStatus | 'EDITED'
export type PoItemUnit = 'EA' | 'BOX' | 'SET' | 'L'

export interface Supplier {
  code: string
  id: number
  name: string
}

export interface PurchaseOrderLine {
  amount: number
  itemName: string
  lineNo: number
  quantity: number
  sku: string
  unit: PoItemUnit
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
  status: PurchaseOrderStatus
  supplierCode: string
  supplierName: string
  updatedAt: string
  warehouseCode: string
  warehouseName: string
}

export const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  APPROVED: 'APPROVED',
  CANCELED: 'CANCELED',
  DRAFT: 'DRAFT',
  RECEIVED: 'RECEIVED',
  SHIPPED: 'SHIPPED',
}

export interface PurchaseOrderFilter {
  from: string
  keyword: string
  status: 'ALL' | PurchaseOrderStatus
  supplierCode: 'ALL' | string
  to: string
}

export interface PoHeaderFormValues {
  expectedAt: string
  note: string
  supplierCode: string
  warehouseCode: string
}

/** PO-02 라인 편집기의 작성 중 라인 */
export interface PoDraftLine {
  itemName: string
  quantity: number
  sku: string | null
  unit: PoItemUnit | null
  unitPrice: number
}

export function emptyDraftLine(): PoDraftLine {
  return { itemName: '', quantity: 0, sku: null, unit: null, unitPrice: 0 }
}

export function poTotalQuantity(lines: Pick<PurchaseOrderLine, 'quantity'>[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function poTotalAmount(lines: Pick<PurchaseOrderLine, 'amount'>[]): number {
  return lines.reduce((sum, line) => sum + line.amount, 0)
}

export function draftLineAmount(line: PoDraftLine): number {
  return line.quantity * line.unitPrice
}

/** 목록 총 수량에 붙일 대표 단위 (라인 단위가 섞이면 첫 라인 기준) */
export function poDominantUnit(lines: PurchaseOrderLine[]): PoItemUnit {
  return lines[0]?.unit ?? 'EA'
}

/** 도착 예정일이 지났고 아직 입고/취소되지 않은 PO */
export function isPoDelayed(po: Pick<PurchaseOrder, 'expectedAt' | 'status'>, today: string): boolean {
  if (!po.expectedAt) return false
  if (po.status === 'RECEIVED' || po.status === 'CANCELED') return false
  return po.expectedAt < today
}
