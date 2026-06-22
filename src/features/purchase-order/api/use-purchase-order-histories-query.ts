import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { mapPurchaseOrderHistory } from '../model/po-history'
import { purchaseOrderKeys } from '../model/po-query-keys'
import type { PurchaseOrderHistoryResponse } from '../model/types'

export function usePurchaseOrderHistoriesQuery(code: string) {
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<PurchaseOrderHistoryResponse[]>(
        `/procurement-orders/${code}/histories`,
      )
      return response.data
    },
    queryKey: purchaseOrderKeys.histories(code),
    select: (data) => data.map(mapPurchaseOrderHistory),
    staleTime: 60_000,
  })
}
