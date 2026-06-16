import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { PageResponse } from '@/shared/api'

import type { SalesOrderStatus } from '../model/types'

export type HqSalesOrderSortField = 'requestedAt' | 'desiredArrivalDate'
export type HqSalesOrderSortDirection = 'asc' | 'desc'
export type HqSalesOrderPageSize = 10 | 20 | 50

export interface HqSalesOrderListItem {
  code: string
  desiredArrivalDate: string
  fromWarehouseCode: string
  itemCount: number
  requestedAt: string
  requestedBy: string
  requesterName: string
  requesterPosition: string
  status: SalesOrderStatus
  totalQuantity: number
  unitSnapshot: string | null
}

export interface HqSalesOrderListParams {
  endDate?: string
  page?: number
  search?: string
  size?: HqSalesOrderPageSize
  sortDirection?: HqSalesOrderSortDirection
  sortField?: HqSalesOrderSortField
  startDate?: string
  status?: SalesOrderStatus[]
  warehouseCode?: string
}

const hqSalesOrdersQueryKey = (params: HqSalesOrderListParams) =>
  ['sales-orders', 'hq', params] as const

function buildHqSalesOrderQueryParams(params: HqSalesOrderListParams) {
  const queryParams: Record<string, number | string> = {}

  if (params.search) queryParams.search = params.search
  if (params.status && params.status.length > 0) queryParams.status = params.status.join(',')
  if (params.warehouseCode) queryParams.warehouseCode = params.warehouseCode
  if (params.startDate) queryParams.startDate = params.startDate
  if (params.endDate) queryParams.endDate = params.endDate
  if (params.sortField) queryParams.sortField = params.sortField
  if (params.sortDirection) queryParams.sortDirection = params.sortDirection
  if (params.page !== undefined) queryParams.page = params.page
  if (params.size !== undefined) queryParams.size = params.size

  return queryParams
}

export function useHqSalesOrdersQuery(params: HqSalesOrderListParams = {}) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.get<PageResponse<HqSalesOrderListItem>>('/sales-orders/hq', {
        params: buildHqSalesOrderQueryParams(params),
      })
      return response.data
    },
    queryKey: hqSalesOrdersQueryKey(params),
    staleTime: 60_000,
  })
}
