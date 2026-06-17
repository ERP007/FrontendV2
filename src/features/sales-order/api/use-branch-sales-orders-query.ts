import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { PageResponse } from '@/shared/api'

import { mapBranchSalesOrderRow } from '../model/so-list-row'
import type { BranchSalesOrderRow } from '../model/so-list-row'
import { salesOrderKeys } from '../model/so-query-keys'
import type {
  BranchSalesOrderSummary,
  PageSize,
  SalesOrderSortField,
  SalesOrderStatus,
  SortDirection,
} from '../model/types'

// 서버 응답 라인 아이템 (SO #9)
export type BranchSalesOrderListItem = BranchSalesOrderSummary

// 화면 소비용 행으로 변환된 페이지
export interface BranchSalesOrderRowPage {
  content: BranchSalesOrderRow[]
  hasNext: boolean
  hasPrevious: boolean
  page: number
  size: number
  totalElements: number
  totalPages: number
}

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

/** SO #9 지점 발주 목록 — GET /sales-orders/branch */
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
    queryKey: salesOrderKeys.branchList(params),
    select: (data): BranchSalesOrderRowPage => ({
      ...data,
      content: data.content.map(mapBranchSalesOrderRow),
    }),
    staleTime: 60_000,
  })
}
