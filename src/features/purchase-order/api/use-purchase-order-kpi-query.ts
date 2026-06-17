import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { purchaseOrderKeys } from '../model/po-query-keys'
import type { PurchaseOrderKpiResponse } from '../model/types'

export function usePurchaseOrderKpiQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<PurchaseOrderKpiResponse>('/procurement-orders/kpi')
      return response.data
    },
    queryKey: purchaseOrderKeys.kpi(),
    staleTime: 60_000,
  })
}
