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
  id: number
  majorCategory: string
  middleCategory: string
  name: string
  unit: ItemUnit
  updatedAt: string
}

/** 분류 트리: 대분류 → 중분류 목록 */
export const ITEM_CATEGORIES: Record<string, string[]> = {
  엔진: ['윤활계통', '흡배기', '점화', '냉각'],
  변속: ['오일/액', '기어'],
  구동: ['클러치', '드라이브샤프트'],
  제동: ['패드/슈', '디스크/드럼'],
  현가: ['댐퍼', '스프링'],
  전장: ['전원', '등화', '센서'],
  공조: ['컴프레서', '필터'],
  외장: ['미러', '램프'],
}

export const ITEM_UNIT_OPTIONS: ItemUnit[] = ['EA', 'BOX', 'SET', 'L']

export type ItemSortKey = 'updatedAt' | 'code'

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
  sort: 'updatedAt',
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
