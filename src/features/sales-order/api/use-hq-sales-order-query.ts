import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { mapHqSalesOrderDetail } from '../model/so-detail'
import { salesOrderKeys } from '../model/so-query-keys'
import type { HqSalesOrderDetailResponse } from '../model/types'

/** SO #13 본사 발주 상세 — GET /sales-orders/hq/{code} */
export function useHqSalesOrderQuery(code: string | undefined) {
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<HqSalesOrderDetailResponse>(`/sales-orders/hq/${code}`)
      return response.data
    },
    queryKey: salesOrderKeys.hqDetail(code ?? ''),
    select: mapHqSalesOrderDetail,
  })
}
