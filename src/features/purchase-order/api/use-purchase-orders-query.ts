import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  PurchaseOrderPageResponse,
  SearchPurchaseOrderRequest,
} from '../model/types'

const purchaseOrdersQueryKey = (params: SearchPurchaseOrderRequest) =>
  ['purchase-orders', 'list', params] as const

function buildParams(params: SearchPurchaseOrderRequest) {
  const queryParams: Record<string, number | string> = {}
  if (params.search) queryParams.search = params.search
  if (params.status) queryParams.status = params.status
  if (params.vendorCode) queryParams.vendorCode = params.vendorCode
  if (params.startDate) queryParams.startDate = params.startDate
  if (params.endDate) queryParams.endDate = params.endDate
  if (params.sortField) queryParams.sortField = params.sortField
  if (params.sortDirection) queryParams.sortDirection = params.sortDirection
  if (params.page !== undefined) queryParams.page = params.page
  if (params.size !== undefined) queryParams.size = params.size
  return queryParams
}

export function usePurchaseOrdersQuery(params: SearchPurchaseOrderRequest = {}) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.get<PurchaseOrderPageResponse>('/procurement-orders', {
        params: buildParams(params),
      })
      return response.data
    },
    queryKey: purchaseOrdersQueryKey(params),
    staleTime: 60_000,
  })
}
