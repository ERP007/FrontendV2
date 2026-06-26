import type { QueryClient } from '@tanstack/react-query'

import { salesOrderKeys } from '../model/so-query-keys'

/**
 * SO 전체 캐시(목록·KPI·상세·이력·진행)를 무효화한다.
 * 외부 재고 변경 후 발주 현황 화면의 현재고 표시까지 다시 계산해야 할 때 사용한다.
 */
export function invalidateSalesOrderQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: salesOrderKeys.all })
}

/**
 * SO 집계 캐시(지점·본사 목록 + KPI) 무효화.
 * 단건 상세가 없는 변경(신규 생성·임시저장)에 사용한다.
 */
export function invalidateSalesOrderCollections(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: salesOrderKeys.branchLists() })
  void queryClient.invalidateQueries({ queryKey: salesOrderKeys.hqLists() })
  void queryClient.invalidateQueries({ queryKey: salesOrderKeys.branchKpi() })
  void queryClient.invalidateQueries({ queryKey: salesOrderKeys.hqKpi() })
}

/**
 * 특정 SO 단건(지점·본사 상세 + 이력) + 집계 캐시 모두 무효화.
 * 상태 변경(제출·요청·승인·거절·취소·도착)에 사용한다.
 */
export function invalidateSalesOrder(queryClient: QueryClient, code: string) {
  void queryClient.invalidateQueries({ queryKey: salesOrderKeys.detail(code) })
  void queryClient.invalidateQueries({ queryKey: salesOrderKeys.histories(code) })
  void queryClient.invalidateQueries({ queryKey: salesOrderKeys.progress(code) })
  invalidateSalesOrderCollections(queryClient)
}
