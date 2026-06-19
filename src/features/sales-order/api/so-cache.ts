import type { QueryClient } from '@tanstack/react-query'

import { salesOrderKeys } from '../model/so-query-keys'

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
  void queryClient.invalidateQueries({ queryKey: salesOrderKeys.branchDetail(code) })
  void queryClient.invalidateQueries({ queryKey: salesOrderKeys.hqDetail(code) })
  void queryClient.invalidateQueries({ queryKey: salesOrderKeys.histories(code) })
  invalidateSalesOrderCollections(queryClient)
}
