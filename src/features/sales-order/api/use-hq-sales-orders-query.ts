import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { PageResponse } from '@/shared/api'

import { salesOrderKeys } from '../model/so-query-keys'
import type {
  HqSalesOrderSummary,
  PageSize,
  SalesOrderSortField,
  SalesOrderStatus,
  SortDirection,
} from '../model/types'

// 화면 호환용 별칭
export type HqSalesOrderSortField = SalesOrderSortField
export type HqSalesOrderSortDirection = SortDirection
export type HqSalesOrderPageSize = PageSize

// 서버 응답 라인 아이템 (SO #12)
export type HqSalesOrderListItem = HqSalesOrderSummary

// UI 가 다루는 목록 파라미터. status 는 배열로 받아 CSV 로 직렬화한다.
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

/** SO #12 본사 발주 목록 — GET /sales-orders/hq */
export function useHqSalesOrdersQuery(params: HqSalesOrderListParams = {}) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.get<PageResponse<HqSalesOrderListItem>>('/sales-orders/hq', {
        params: buildHqSalesOrderQueryParams(params),
      })
      return response.data
    },
    queryKey: salesOrderKeys.hqList(params),
    staleTime: 60_000,
  })
}
