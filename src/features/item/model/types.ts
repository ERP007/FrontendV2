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

/** 분류 트리: 대분류 → 중분류 목록 */
export const ITEM_CATEGORIES: Record<string, string[]> = {
  엔진: ['윤활계통', '필터'],
  점화: [],
  제동: [],
  동력전달: [],
  '현가·조향': [],
  전장: [],
  '외장·기타': [],
}

export const ITEM_UNIT_OPTIONS: ItemUnit[] = ['EA', 'BOX', 'SET', 'L']

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
  autoGenerateCode: boolean
  code: string
  defaultSafetyStock: number
  description: string
  majorCategory: string
  middleCategory: string
  name: string
  unit: ItemUnit
}
