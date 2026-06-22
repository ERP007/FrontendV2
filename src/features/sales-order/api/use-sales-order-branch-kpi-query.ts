import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { salesOrderKeys } from '../model/so-query-keys'
import type { BranchSalesOrderKpiResponse } from '../model/types'

/** SO #11 지점 KPI — GET /sales-orders/kpi/branch */
export function useSalesOrderBranchKpiQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<BranchSalesOrderKpiResponse>('/sales-orders/kpi/branch')
      return response.data
    },
    queryKey: salesOrderKeys.branchKpi(),
    staleTime: 60_000,
  })
}
