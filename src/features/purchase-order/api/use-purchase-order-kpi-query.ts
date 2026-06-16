import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { PurchaseOrderKpiResponse } from '../model/types'

const purchaseOrderKpiQueryKey = ['purchase-orders', 'kpi'] as const

export function usePurchaseOrderKpiQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<PurchaseOrderKpiResponse>('/procurement-orders/kpi')
      return response.data
    },
    queryKey: purchaseOrderKpiQueryKey,
    staleTime: 60_000,
  })
}
