import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { SoBranchKpi } from '../model/filter-sales-orders'

const salesOrderBranchKpiQueryKey = ['sales-orders', 'kpi', 'branch'] as const

export function useSalesOrderBranchKpiQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<SoBranchKpi>('/sales-orders/kpi/branch')
      return response.data
    },
    queryKey: salesOrderBranchKpiQueryKey,
    staleTime: 60_000,
  })
}
