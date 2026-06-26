import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { salesOrderKeys } from '../model/so-query-keys'
import type { HqSalesOrderKpiResponse } from '../model/types'

/** SO #14 본사 KPI — GET /sales-orders/kpi/hq */
export function useSalesOrderHqKpiQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<HqSalesOrderKpiResponse>('/sales-orders/kpi/hq')
      return response.data
    },
    queryKey: salesOrderKeys.hqKpi(),
    staleTime: 0,
  })
}
