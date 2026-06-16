import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { PurchaseOrderHistoryResponse } from '../model/types'

const purchaseOrderHistoriesQueryKey = (code: string) =>
  ['purchase-orders', 'histories', code] as const

export function usePurchaseOrderHistoriesQuery(code: string | undefined) {
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<PurchaseOrderHistoryResponse[]>(
        `/procurement-orders/${code}/histories`,
      )
      return response.data
    },
    queryKey: purchaseOrderHistoriesQueryKey(code ?? ''),
    staleTime: 60_000,
  })
}
