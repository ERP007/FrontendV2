import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { StockKpi } from '../model/types'

export const stockKpiQueryKey = ['stocks', 'kpi'] as const

/**
 * 재고 KPI를 조회한다(GET /inventory/stocks/kpi).
 * 집계 범위는 호출자 소속으로 강제된다(BRANCH는 자기 지점 창고).
 */
export function useStockKpiQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<StockKpi>('/inventory/stocks/kpi')
      return response.data
    },
    queryKey: stockKpiQueryKey,
    staleTime: 60_000,
  })
}
