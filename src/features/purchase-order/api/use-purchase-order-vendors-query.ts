import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { purchaseOrderKeys } from '../model/po-query-keys'
import type { VendorResponse } from '../model/types'

export function usePurchaseOrderVendorsQuery(search = '') {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<VendorResponse[]>('/procurement-orders/vendors', {
        params: search ? { search } : undefined,
      })
      return response.data
    },
    queryKey: purchaseOrderKeys.vendors(search),
    staleTime: 60_000,
  })
}
