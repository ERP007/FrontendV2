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

export type ItemStockStatus = 'NORMAL' | 'LOW' | 'OUT'

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

export interface ItemListParams extends ItemFilter {
  page: number
  size: number
}

export interface ItemListResponse {
  content: Item[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export const DEFAULT_ITEM_FILTER: ItemFilter = {
  keyword: '',
  majorCategory: 'ALL',
  middleCategory: 'ALL',
  sort: 'updatedAt,desc',
  status: 'ALL',
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

  if (stock.currentStock === 0) {
    return 'OUT'
  }

  return stock.currentStock < stock.safetyStock ? 'LOW' : 'NORMAL'
}
