import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { mapPurchaseOrderDetail } from '../model/po-detail'
import { purchaseOrderKeys } from '../model/po-query-keys'
import type { PurchaseOrderDetailResponse } from '../model/types'

export function usePurchaseOrderQuery(code: string) {
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<PurchaseOrderDetailResponse>(
        `/procurement-orders/${code}`,
      )
      return response.data
    },
    queryKey: purchaseOrderKeys.detail(code),
    select: mapPurchaseOrderDetail,
    staleTime: 60_000,
  })
}
