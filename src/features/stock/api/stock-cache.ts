import type { QueryClient } from '@tanstack/react-query'

export const stockQueryBaseKey = ['stocks'] as const
const stockMovementQueryBaseKey = ['movements'] as const

/**
 * 재고 수량/상태에 의존하는 조회 캐시를 무효화한다.
 * 목록·KPI·상세·창고별 수량과, 재고 변경으로 생성되는 이동 이력을 함께 최신화한다.
 */
export function invalidateStockQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: stockQueryBaseKey })
  void queryClient.invalidateQueries({ queryKey: stockMovementQueryBaseKey })
}
