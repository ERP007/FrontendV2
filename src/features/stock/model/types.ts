/**
 * Inventory Service swagger 응답 스키마 기준 UI 모델.
 * (docs/api/inventory-openapi.json — StockResponse/MovementResponse/StockKpiResponse 등과 1:1)
 */
export type ItemUnit = 'EA' | 'BOX' | 'SET' | 'L'
export type StockStatus = 'NORMAL' | 'LOW'
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
  /** 아이템(SKU) 활성 여부. false면 비활성 부품 → 상태에 '비활성화' 표시 + 행 흐리게. (구 응답 호환 위해 옵셔널) */
  itemActive?: boolean
  /** 창고 활성 여부. false면 비활성 창고 재고 → 부품명·코드를 흐리게 표시. (구 응답 호환 위해 옵셔널) */
  warehouseActive?: boolean
  warehouseCode: string
  warehouseId: number
  warehouseName: string
}

/** swagger StockKpiResponse */
export interface StockKpi {
  /** 안전재고 충족률(정상÷총×100, %). 신 백엔드가 계산해 보낸다. 없으면 total·low로 유도한다. */
  fulfillmentRate?: number
  lowStockCount: number
  /** 구 백엔드 호환(전환기). 신 응답엔 없다 — 충족률을 신 정의(정상=총−부족)로 유도할 때만 쓴다. */
  noStockCount?: number
  recentAdjustCount: number
  totalSkuCount: number
}

/** swagger WarehouseStockResponse — 상세 패널은 활성 창고만 노출한다(비활성 창고 행은 서버에서 제외). */
export interface WarehouseStock {
  quantity: number
  safetyStock: number
  status: StockStatus
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
 * executorName(수행자 이름)은 이력 스냅샷이라 목록 응답에 항상 포함된다 — 화면은 사번 대신 이름을 표시한다.
 */
export interface Movement {
  delta: number
  executorEmpNo: string
  executorName: string
  id: number
  itemName: string
  /** 조정 메모(입고·출고는 null/미배포 백엔드는 undefined). 비어있지 않을 때만 이력 화면이 '메모 보기' 버튼을 노출한다. */
  note?: string | null
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
export type StockSortDirection = 'asc' | 'desc'

export interface StockSort {
  direction: StockSortDirection
  field: StockSortKey
}

/** 첫 진입 기본 정렬: 안전재고 대비 비율이 낮은(위험한) 재고 먼저. */
export const DEFAULT_STOCK_SORT: StockSort = { direction: 'asc', field: 'safetyRatio' }

export interface StockFilter {
  keyword: string
  status: 'ALL' | StockStatus
  warehouseCode: 'ALL' | string
  /** 비활성(창고/부품) 재고 표시 여부. 기본 false(활성만), 토글로 켜면 포함. */
  includeInactive: boolean
}

export const DEFAULT_STOCK_FILTER: StockFilter = {
  keyword: '',
  status: 'ALL',
  warehouseCode: 'ALL',
  includeInactive: false,
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
  // 재고 0도 안전재고 미만이면 '부족'(LOW)에 편입. 안전재고 0이면 0재고도 '충분'(NORMAL).
  return quantity < safetyStock ? 'LOW' : 'NORMAL'
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
