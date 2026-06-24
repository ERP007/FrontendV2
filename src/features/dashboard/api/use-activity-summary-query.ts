import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { ActivitySummary } from '../model/types'

export const activitySummaryQueryKey = ['stocks', 'movements', 'summary'] as const

/**
 * 최근 7일 재고 이동 활동을 조회한다(GET /inventory/stocks/movements/summary).
 * 집계 범위는 호출자 소속으로 강제된다(BRANCH는 자기 지점 창고, ADMIN·HQ는 전사).
 */
export function useActivitySummaryQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<ActivitySummary>('/inventory/stocks/movements/summary')
      return response.data
    },
    queryKey: activitySummaryQueryKey,
    staleTime: 60_000,
  })
}
