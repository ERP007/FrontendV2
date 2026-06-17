import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { mapSalesOrderHistory } from '../model/so-history'
import { salesOrderKeys } from '../model/so-query-keys'
import type { SalesOrderHistoryResponse } from '../model/types'

/** SO #15 변경 이력(역할 자동분기) — GET /sales-orders/{code}/histories */
export function useSalesOrderHistoriesQuery(code: string) {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<SalesOrderHistoryResponse[]>(
        `/sales-orders/${code}/histories`,
      )
      return response.data
    },
    queryKey: salesOrderKeys.histories(code),
    select: (data) => data.map(mapSalesOrderHistory),
  })
}
