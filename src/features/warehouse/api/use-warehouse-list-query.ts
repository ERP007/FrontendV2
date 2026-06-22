import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { WarehouseFilter, WarehouseListItem, WarehouseSort } from '../model/types'

/** GET /inventory/warehouses 응답 (swagger WarehouseListResponse) */
export interface WarehouseListResponse {
  content: WarehouseListItem[]
  sort: string
  totalElements: number
}

/** 목록 조회 파라미터: 검색/유형/상태 필터(WarehouseFilter) + 정렬. */
export interface WarehouseListParams extends WarehouseFilter {
  sort: WarehouseSort
}

/** invalidate용 prefix. 개별 쿼리 키는 파라미터까지 포함해 검색/정렬별로 캐시를 분리한다. */
export const warehouseListBaseKey = ['warehouses', 'list'] as const

export const warehouseListQueryKey = (params: WarehouseListParams) =>
  [...warehouseListBaseKey, params] as const

/**
 * 창고 목록을 서버 사이드 검색·정렬로 조회한다(GET /inventory/warehouses).
 *
 * keyword/type/status/sort를 쿼리 파라미터로 전달하며, 'ALL'·빈 값은 생략해 백엔드 기본값을 따른다.
 * 검색어·정렬 변경 시 이전 결과를 유지(keepPreviousData)해 표가 깜빡이지 않게 한다.
 */
export function useWarehouseListQuery(params: WarehouseListParams) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const search = new URLSearchParams()
      const keyword = params.keyword.trim()
      if (keyword) search.set('keyword', keyword)
      if (params.type !== 'ALL') search.set('type', params.type)
      if (params.status !== 'ALL') search.set('status', params.status)
      search.set('sort', `${params.sort.field},${params.sort.direction}`)

      const response = await api.get<WarehouseListResponse>(
        `/inventory/warehouses?${search.toString()}`,
      )
      return response.data
    },
    queryKey: warehouseListQueryKey(params),
    staleTime: 60_000,
  })
}
