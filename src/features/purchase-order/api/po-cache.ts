import type { QueryClient } from '@tanstack/react-query'

import { purchaseOrderKeys } from '../model/po-query-keys'

/**
 * PO 집계 캐시(목록·KPI) 무효화.
 * 단건 상세가 없는 변경(신규 생성·임시저장)에 사용한다.
 */
export function invalidatePurchaseOrderCollections(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() })
  void queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.kpi() })
}

/**
 * 특정 PO 단건(상세·이력) + 집계 캐시 모두 무효화.
 * 상태 변경(확정·입고·취소)·수정에 사용한다.
 */
export function invalidatePurchaseOrder(queryClient: QueryClient, code: string) {
  void queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(code) })
  void queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.histories(code) })
  invalidatePurchaseOrderCollections(queryClient)
}
