import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { SoHqKpi } from '../model/filter-sales-orders'

interface ApiContentResponse<T> {
  content: T
}

const salesOrderHqKpiQueryKey = ['sales-orders', 'kpi', 'hq'] as const

function hasContent<T>(value: T | ApiContentResponse<T>): value is ApiContentResponse<T> {
  return typeof value === 'object' && value !== null && 'content' in value
}

export function useSalesOrderHqKpiQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<SoHqKpi | ApiContentResponse<SoHqKpi>>(
        '/sales-orders/kpi/hq',
      )

      return hasContent(response.data) ? response.data.content : response.data
    },
    queryKey: salesOrderHqKpiQueryKey,
    staleTime: 60_000,
  })
}
