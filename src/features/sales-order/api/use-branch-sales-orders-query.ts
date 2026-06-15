import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { PageResponse } from '@/shared/api'

import type { SalesOrderStatus } from '../model/types'

export type BranchSalesOrderSortField = 'requestedAt' | 'desiredArrivalDate'
export type BranchSalesOrderSortDirection = 'asc' | 'desc'

export interface BranchSalesOrderListItem {
  code: string
  desiredArrivalDate: string
  itemCount: number
  requestedAt: string | null
  status: SalesOrderStatus
  totalQuantity: number | null
  unitSnapshot: string | null
}

export interface BranchSalesOrderListParams {
  endDate?: string
  page?: number
  search?: string
  size?: number
  sortDirection?: BranchSalesOrderSortDirection
  sortField?: BranchSalesOrderSortField
  startDate?: string
  status?: SalesOrderStatus[]
}

const branchSalesOrdersQueryKey = (params: BranchSalesOrderListParams) =>
  ['sales-orders', 'branch', params] as const

function buildBranchSalesOrderQueryParams(params: BranchSalesOrderListParams) {
  const queryParams: Record<string, number | string> = {}

  if (params.search) queryParams.search = params.search
  if (params.status && params.status.length > 0) queryParams.status = params.status.join(',')
  if (params.startDate) queryParams.startDate = params.startDate
  if (params.endDate) queryParams.endDate = params.endDate
  if (params.sortField) queryParams.sortField = params.sortField
  if (params.sortDirection) queryParams.sortDirection = params.sortDirection
  if (params.page !== undefined) queryParams.page = params.page
  if (params.size !== undefined) queryParams.size = params.size

  return queryParams
}

export function useBranchSalesOrdersQuery(params: BranchSalesOrderListParams = {}) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.get<PageResponse<BranchSalesOrderListItem>>(
        '/sales-orders/branch',
        { params: buildBranchSalesOrderQueryParams(params) },
      )
      return response.data
    },
    queryKey: branchSalesOrdersQueryKey(params),
    staleTime: 60_000,
  })
}
