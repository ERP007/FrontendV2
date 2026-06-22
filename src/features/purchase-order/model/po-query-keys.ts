import type { SearchPurchaseOrderRequest } from './types'

/**
 * PO 관련 React Query 캐시 키 팩토리.
 * 계층 구조라 상위 키로 invalidate 하면 하위가 모두 무효화된다.
 * (예: lists() 무효화 → 모든 params 조합의 목록 쿼리 무효화)
 */
export const purchaseOrderKeys = {
  all: ['purchase-orders'] as const,

  lists: () => [...purchaseOrderKeys.all, 'list'] as const,
  list: (params: SearchPurchaseOrderRequest) =>
    [...purchaseOrderKeys.lists(), params] as const,

  details: () => [...purchaseOrderKeys.all, 'detail'] as const,
  detail: (code: string) => [...purchaseOrderKeys.details(), code] as const,

  histories: (code: string) => [...purchaseOrderKeys.all, 'histories', code] as const,

  kpi: () => [...purchaseOrderKeys.all, 'kpi'] as const,

  vendors: (search: string) => [...purchaseOrderKeys.all, 'vendors', search] as const,
}
