import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { mapPurchaseOrderDetail } from '../model/po-detail'
import type { PurchaseOrderDetailResponse } from '../model/types'

const purchaseOrderQueryKey = (code: string) =>
  ['purchase-orders', 'detail', code] as const

export function usePurchaseOrderQuery(code: string) {
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<PurchaseOrderDetailResponse>(
        `/procurement-orders/${code}`,
      )
      return response.data
    },
    queryKey: purchaseOrderQueryKey(code),
    select: mapPurchaseOrderDetail,
    staleTime: 60_000,
  })
}
