/**
 * Item 서비스 swagger 미수신 — HANDOFF §10(IM-01/IM-02) 기반 UI 모델.
 * unit enum은 Inventory swagger의 itemUnit과 동일하게 유지한다.
 * swagger 수신 시 필드명을 응답 스키마와 정합시킨다.
 */
export type ItemUnit = 'EA' | 'BOX' | 'SET' | 'L'

export interface Item {
  active: boolean
  code: string
  createdAt: string
  defaultSafetyStock: number
  description: string | null
  id: number | string
  majorCategory: string
  middleCategory: string
  name: string
  unit: ItemUnit
  updatedAt: string
}

export interface ItemCategory {
  categoryCode: string
  categoryName: string
  displayOrder: number
}

export interface ItemSubCategory extends ItemCategory {
  parentCategoryCode: string
}

export const ITEM_UNIT_OPTIONS: ItemUnit[] = ['EA', 'BOX', 'SET', 'L']

export interface ItemUnitOption {
  name: string
  unit: ItemUnit
}

export interface ItemSkuCheckResult {
  available: boolean
  message: string
  sku: string
}

export type ItemStockStatus = 'NORMAL' | 'LOW'

export interface ItemDetail {
  active: boolean
  categoryCode: string
  categoryName: string
  createdAt: string
  name: string
  safetyStock: number
  sku: string
  subCategoryCode: string
  subCategoryName: string
  unit: ItemUnit
  unitPrice: number
  updatedAt: string
}

export interface ItemDetailFormValues {
  categoryCode: string
  name: string
  safetyStock: number
  subCategoryCode: string
  unit: ItemUnit
  unitPrice: number
}

export interface UpdateItemRequest {
  categoryCode: string
  name: string
  safetyStock: number
  subCategoryCode: string
  unit: ItemUnit
  unitPrice: number
}

export interface ItemStockRow {
  currentStock: number
  safetyStock: number
  status?: ItemStockStatus
  warehouseCode: string
  warehouseName: string
}

export interface CreateItemRequest {
  categoryCode: string
  name: string
  safetyStock: number
  sku: string
  unit: ItemUnit
  unitPrice: number
}

export interface CreateItemResponse {
  active: boolean
  categoryCode: string
  categoryName: string
  createdAt: string
  name: string
  parentCategoryCode: string
  parentCategoryName: string
  safetyStock: number
  sku: string
  unit: ItemUnit
  unitPrice: number
  updatedAt: string
}

export type ItemSortKey =
  | 'sku,asc'
  | 'sku,desc'
  | 'name,asc'
  | 'name,desc'
  | 'updatedAt,desc'
  | 'updatedAt,asc'

export interface ItemFilter {
  keyword: string
  majorCategory: 'ALL' | string
  middleCategory: 'ALL' | string
  sort: ItemSortKey
  status: 'ALL' | 'ACTIVE' | 'INACTIVE'
}

export const DEFAULT_ITEM_FILTER: ItemFilter = {
  keyword: '',
  majorCategory: 'ALL',
  middleCategory: 'ALL',
  sort: 'updatedAt,desc',
  status: 'ALL',
}

/**
 * GET /api/items 응답 단건. swagger 미수신 — 백엔드 응답 명세 기준.
 * 기존 `Item`은 fixture 기반 UI 모델, 점진적으로 본 타입으로 교체.
 */
export interface ItemListItem {
  active: boolean
  categoryCode: string
  categoryName: string
  createdAt: string
  name: string
  parentCategoryCode: string
  parentCategoryName: string
  safetyStock: number
  sku: string
  unit: ItemUnit
  unitPrice: number
  updatedAt: string
}

/** POST /items/batch — sku 목록으로 품목을 일괄 조회 */
export interface ItemBatchRequest {
  skus: string[]
}

/** batch 응답 단건. ItemListItem 의 부분집합을 재사용 */
export type ItemBatchItem = Pick<
  ItemListItem,
  'active' | 'categoryCode' | 'name' | 'safetyStock' | 'sku' | 'unit' | 'unitPrice'
>

export interface ItemBatchResponse {
  items: ItemBatchItem[]
  notFoundSkus: string[]
}

export interface ItemFormValues {
  categoryCode: string
  majorCategory: string
  name: string
  safetyStock: number
  sku: string
  unit: ItemUnit
  unitPrice: number
}

export function resolveItemStockStatus(stock: Pick<ItemStockRow, 'currentStock' | 'safetyStock' | 'status'>): ItemStockStatus {
  if (stock.status) {
    return stock.status
  }

  // 재고 0도 안전재고 미만이면 '부족'(LOW)에 편입. 안전재고 0이면 0재고도 '정상'(NORMAL).
  return stock.currentStock < stock.safetyStock ? 'LOW' : 'NORMAL'
}
