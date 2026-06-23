import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { Stock, StockFilter, StockSort } from '../model/types'

/** GET /inventory/stocks 응답 (swagger StockListResponse). page는 1-base. */
export interface StockListResponse {
  content: Stock[]
  hasNext: boolean
  hasPrevious: boolean
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface StockListParams {
  filter: StockFilter
  page: number
  size: number
  sort: StockSort
}

export const stockListBaseKey = ['stocks', 'list'] as const

export const stockListQueryKey = (params: StockListParams) =>
  [...stockListBaseKey, params] as const

/**
 * 재고 목록을 서버 사이드 검색·필터·정렬·페이지네이션으로 조회한다(GET /inventory/stocks).
 * keyword/warehouseCodes/status는 'ALL'·빈 값이면 생략한다. page는 1-base.
 * 페이지·필터 변경 시 이전 결과를 유지(keepPreviousData)해 표가 깜빡이지 않게 한다.
 */
export function useStockListQuery(params: StockListParams) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { filter, page, size, sort } = params
      const search = new URLSearchParams()
      const keyword = filter.keyword.trim()
      if (keyword) search.set('keyword', keyword)
      if (filter.warehouseCode !== 'ALL') search.set('warehouseCodes', filter.warehouseCode)
      if (filter.status !== 'ALL') search.set('status', filter.status)
      search.set('sort', `${sort.field},${sort.direction}`)
      search.set('page', String(page))
      search.set('size', String(size))

      const response = await api.get<StockListResponse>(`/inventory/stocks?${search.toString()}`)
      return response.data
    },
    queryKey: stockListQueryKey(params),
    staleTime: 30_000,
  })
}
