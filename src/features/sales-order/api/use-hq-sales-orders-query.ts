import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { PageResponse } from '@/shared/api'

import { mapHqSalesOrderRow } from '../model/so-list-row'
import type { HqSalesOrderRow } from '../model/so-list-row'
import { salesOrderKeys } from '../model/so-query-keys'
import type {
  HqSalesOrderQuery,
  HqSalesOrderSummary,
  PageSize,
  SalesOrderSortField,
  SalesOrderStatus,
  SortDirection,
} from '../model/types'

// UI 가 다루는 목록 파라미터. status 는 배열로 받아 CSV 로 직렬화한다.
export interface HqSalesOrderListParams {
  endDate?: string
  page?: number
  search?: string
  size?: PageSize
  sortDirection?: SortDirection
  sortField?: SalesOrderSortField
  startDate?: string
  status?: SalesOrderStatus[]
  warehouseCode?: string
}

function buildHqSalesOrderQueryParams(params: HqSalesOrderListParams): HqSalesOrderQuery {
  const queryParams: HqSalesOrderQuery = {}

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

/** SO #12 본사 발주 목록 — GET /sales-orders/hq */
export function useHqSalesOrdersQuery(params: HqSalesOrderListParams = {}) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.get<PageResponse<HqSalesOrderSummary>>('/sales-orders/hq', {
        params: buildHqSalesOrderQueryParams(params),
      })
      return response.data
    },
    queryKey: salesOrderKeys.hqList(params),
    select: (data): PageResponse<HqSalesOrderRow> => ({
      ...data,
      content: data.content.map(mapHqSalesOrderRow),
    }),
    staleTime: 0,
  })
}
