import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { VendorResponse } from '../model/types'

const purchaseOrderVendorsQueryKey = (search: string) =>
  ['purchase-orders', 'vendors', search] as const

export function usePurchaseOrderVendorsQuery(search = '') {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<VendorResponse[]>('/procurement-orders/vendors', {
        params: search ? { search } : undefined,
      })
      return response.data
    },
    queryKey: purchaseOrderVendorsQueryKey(search),
    staleTime: 60_000,
  })
}
