/**
 * Inventory Service swagger 응답 스키마 기준 UI 모델.
 * (docs/api/inventory-openapi.json — StockResponse/MovementResponse/StockKpiResponse 등과 1:1)
 */
export type ItemUnit = 'EA' | 'BOX' | 'SET' | 'L'
export type StockStatus = 'NORMAL' | 'LOW' | 'OUT'
export type MovementType = 'INBOUND' | 'OUTBOUND' | 'INCREASE' | 'DECREASE' | 'ADJUST'
export type AdjustmentType = 'INCREASE' | 'DECREASE' | 'ADJUST'
export type AdjustmentReason = 'DAMAGE' | 'LOST' | 'FOUND'

/** swagger StockResponse */
export interface Stock {
  id: number
  itemName: string
  itemUnit: ItemUnit
  lastAdjustedAt: string
  quantity: number
  safetyStock: number
  sku: string
  status: StockStatus
  /** 창고 활성 여부. false면 비활성 창고 재고 → 부품명·코드를 흐리게 표시. (구 응답 호환 위해 옵셔널) */
  warehouseActive?: boolean
  warehouseCode: string
  warehouseId: number
  warehouseName: string
}

/** swagger StockKpiResponse */
export interface StockKpi {
  lowStockCount: number
  noStockCount: number
  recentAdjustCount: number
  totalSkuCount: number
}

/** swagger WarehouseStockResponse */
export interface WarehouseStock {
  quantity: number
  safetyStock: number
  status: StockStatus
  /** 창고 활성 여부. false면 비활성 창고 → 상세 패널에서 흐리게 표시. (구 응답 호환 위해 옵셔널) */
  warehouseActive?: boolean
  warehouseCode: string
  warehouseId: number
  warehouseName: string
}

/** swagger MovementHistoryResponse */
export interface MovementHistoryEntry {
  delta: number
  executorEmpNo: string
  executorName: string
  occurredAt: string
  type: MovementType
}

/** swagger StockSkuDetailResponse — majorCategory/middleCategory는 Item 통합 비활성/실패 시 null. */
export interface StockSkuDetail {
  history: MovementHistoryEntry[]
  itemName: string
  itemUnit: ItemUnit
  majorCategory: string | null
  middleCategory: string | null
  sku: string
  totalQuantity: number
  totalSafetyStock: number
  warehouse: WarehouseStock[]
}

/**
 * swagger MovementResponse 기준(GET /inventory/stocks/movements).
 * 목록 응답에는 executorName이 없어 옵셔널이다 — 없으면 화면에서 executorEmpNo로 대체한다.
 * (백엔드 확장 또는 User 서비스 조인 시 채워짐)
 */
export interface Movement {
  delta: number
  executorEmpNo: string
  executorName?: string
  id: number
  itemName: string
  occurredAt: string
  reason: AdjustmentReason | null
  sku: string
  sourceRef: string
  type: MovementType
  unit: ItemUnit
  warehouseCode: string
  warehouseName: string
}

export type StockSortKey = 'safetyRatio' | 'name' | 'quantity' | 'lastAdjustedAt'

export interface StockFilter {
  keyword: string
  sort: StockSortKey
  status: 'ALL' | StockStatus
  warehouseCode: 'ALL' | string
}

export const DEFAULT_STOCK_FILTER: StockFilter = {
  keyword: '',
  sort: 'safetyRatio',
  status: 'ALL',
  warehouseCode: 'ALL',
}

export interface MovementFilter {
  from: string
  keyword: string
  to: string
  type: 'ALL' | MovementType
  warehouseCode: 'ALL' | string
}

/**
 * 백엔드 MovementSort가 지원하는 정렬 속성. 화면은 이 중 일시(occurredAt) 정렬만 노출한다.
 * (delta는 백엔드 지원이나 현재 UI 미노출 — 필요 시 헤더만 추가하면 된다.)
 */
export type MovementSortField = 'occurredAt' | 'delta'
export type MovementSortDirection = 'asc' | 'desc'

export interface MovementSort {
  direction: MovementSortDirection
  field: MovementSortField
}

/** 백엔드 기본 정렬(occurredAt,desc)과 일치시킨다. */
export const DEFAULT_MOVEMENT_SORT: MovementSort = { direction: 'desc', field: 'occurredAt' }

/** swagger SafetyStockEditResponse — 안전재고 조정 모달 프리필. */
export interface SafetyStockEdit {
  itemName: string
  itemUnit: ItemUnit
  quantity: number
  safetyStock: number
  sku: string
  version: number
  warehouseCode: string
}

/** swagger StockAdjustmentRequest 대응 폼 값 */
export interface AdjustmentFormValues {
  adjustmentType: AdjustmentType
  note: string
  quantity: number
  reason: AdjustmentReason
  warehouseCode: string
}

/** swagger StockCreateRequest 대응 폼 값 (ADMIN 재고 신규 생성). */
export interface StockCreateFormValues {
  itemName: string
  itemUnit: ItemUnit
  quantity: number
  safetyStock: number
  sku: string
  warehouseCode: string
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  LOW: '부족',
  NORMAL: '충분',
  OUT: '없음',
}

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  ADJUST: '실사 보정',
  DECREASE: '조정(감소)',
  INBOUND: '입고',
  INCREASE: '조정(증가)',
  OUTBOUND: '출고',
}

export const ADJUSTMENT_TYPE_LABELS: Record<AdjustmentType, string> = {
  ADJUST: '실사 보정',
  DECREASE: '감소 −',
  INCREASE: '증가 +',
}

export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
  DAMAGE: '파손',
  FOUND: '실사 발견',
  LOST: '분실',
}

export function resolveStockStatus(quantity: number, safetyStock: number): StockStatus {
  if (quantity <= 0) return 'OUT'
  if (quantity < safetyStock) return 'LOW'
  return 'NORMAL'
}

/** 조정 유형별 조정 후 예상 재고 (ADJUST는 실사값으로 덮어씀) */
export function previewAdjustedQuantity(
  current: number,
  type: AdjustmentType,
  quantity: number,
): number {
  if (type === 'INCREASE') return current + quantity
  if (type === 'DECREASE') return current - quantity
  return quantity
}

/** 이력 행의 사유·원천 라벨 (예: "발주 입고", "고객 출고", "파손") */
export function movementSourceLabel(movement: Pick<Movement, 'reason' | 'type'>): string {
  if (movement.type === 'INBOUND') return '발주 입고'
  if (movement.type === 'OUTBOUND') return '고객 출고'
  if (movement.type === 'ADJUST') return '실사 보정'
  return movement.reason ? ADJUSTMENT_REASON_LABELS[movement.reason] : MOVEMENT_TYPE_LABELS[movement.type]
}
