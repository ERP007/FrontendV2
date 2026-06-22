import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { mapBranchSalesOrderDetail } from '../model/so-detail'
import { salesOrderKeys } from '../model/so-query-keys'
import type { BranchSalesOrderDetailResponse } from '../model/types'

/** SO #10 지점 발주 상세 — GET /sales-orders/branch/{code} */
export function useBranchSalesOrderQuery(code: string | undefined) {
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<BranchSalesOrderDetailResponse>(
        `/sales-orders/branch/${code}`,
      )
      return response.data
    },
    queryKey: salesOrderKeys.branchDetail(code ?? ''),
    select: mapBranchSalesOrderDetail,
  })
}
