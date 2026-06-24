import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { mapSalesOrderDetail } from '../model/so-detail'
import { salesOrderKeys } from '../model/so-query-keys'
import type { SalesOrderDetailResponse } from '../model/types'

/** SO #13 발주 상세(지점) — GET /sales-orders/{code} */
export function useBranchSalesOrderQuery(code: string | undefined) {
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<SalesOrderDetailResponse>(`/sales-orders/${code}`)
      return response.data
    },
    queryKey: salesOrderKeys.detail(code ?? ''),
    select: mapSalesOrderDetail,
  })
}
