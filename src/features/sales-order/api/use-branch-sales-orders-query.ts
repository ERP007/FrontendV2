import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { PageResponse } from '@/shared/api'

import { mapBranchSalesOrderRow } from '../model/so-list-row'
import type { BranchSalesOrderRow } from '../model/so-list-row'
import { salesOrderKeys } from '../model/so-query-keys'
import type {
  BranchSalesOrderQuery,
  BranchSalesOrderSummary,
  PageSize,
  SalesOrderSortField,
  SalesOrderStatus,
  SortDirection,
} from '../model/types'

// UI 가 다루는 목록 파라미터. status 는 배열로 받아 CSV 로 직렬화한다.
export interface BranchSalesOrderListParams {
  endDate?: string
  page?: number
  search?: string
  size?: PageSize
  sortDirection?: SortDirection
  sortField?: SalesOrderSortField
  startDate?: string
  status?: SalesOrderStatus[]
}

function buildBranchSalesOrderQueryParams(params: BranchSalesOrderListParams): BranchSalesOrderQuery {
  const queryParams: BranchSalesOrderQuery = {}

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

/** SO #9 지점 발주 목록 — GET /sales-orders/branch */
export function useBranchSalesOrdersQuery(params: BranchSalesOrderListParams = {}) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.get<PageResponse<BranchSalesOrderSummary>>(
        '/sales-orders/branch',
        { params: buildBranchSalesOrderQueryParams(params) },
      )
      return response.data
    },
    queryKey: salesOrderKeys.branchList(params),
    select: (data): PageResponse<BranchSalesOrderRow> => ({
      ...data,
      content: data.content.map(mapBranchSalesOrderRow),
    }),
    staleTime: 60_000,
  })
}
