import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

export interface SalesOrderHqKpi {
  approvedCount: number
  delayedCount: number
  requestedCount: number
  totalCount: number
}

const salesOrderHqKpiQueryKey = ['sales-orders', 'kpi', 'hq'] as const

export function useSalesOrderHqKpiQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<SalesOrderHqKpi>('/sales-orders/kpi/hq')
      return response.data
    },
    queryKey: salesOrderHqKpiQueryKey,
    staleTime: 60_000,
  })
}
