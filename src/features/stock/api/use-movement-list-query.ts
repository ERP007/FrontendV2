import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { Movement, MovementFilter, MovementSort } from '../model/types'

/**
 * GET /inventory/stocks/movements 응답 (swagger MovementListResponse). page는 1-base.
 * content는 executorName(수행자 이름)을 포함한다 — 화면은 사번 대신 이름을 표시한다.
 */
export interface MovementListResponse {
  content: Movement[]
  hasNext: boolean
  hasPrevious: boolean
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface MovementListParams {
  /** 시작일 > 종료일 등 조회가 불가능한 상태에서 호출을 막는다. */
  enabled?: boolean
  filter: MovementFilter
  page: number
  size: number
  sort: MovementSort
}

export const movementListBaseKey = ['movements', 'list'] as const

export const movementListQueryKey = (params: Omit<MovementListParams, 'enabled'>) =>
  [...movementListBaseKey, params] as const

/**
 * 재고 이동 이력을 서버 사이드 검색·필터·정렬·페이지네이션으로 조회한다(GET /inventory/stocks/movements).
 * keyword/warehouseCodes/type은 'ALL'·빈 값이면 생략하고, sort는 "{property},{direction}"으로 보낸다.
 * BRANCH 사용자는 백엔드가 자기 지점 창고로 범위를 강제한다. page는 1-base.
 * 페이지·필터 변경 시 이전 결과를 유지(keepPreviousData)해 표가 깜빡이지 않게 한다.
 */
export function useMovementListQuery({ enabled = true, ...params }: MovementListParams) {
  return useQuery({
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { filter, page, size, sort } = params
      const search = new URLSearchParams()
      const keyword = filter.keyword.trim()
      if (keyword) search.set('keyword', keyword)
      if (filter.warehouseCode !== 'ALL') search.set('warehouseCodes', filter.warehouseCode)
      if (filter.type !== 'ALL') search.set('type', filter.type)
      if (filter.from) search.set('from', filter.from)
      if (filter.to) search.set('to', filter.to)
      search.set('sort', `${sort.field},${sort.direction}`)
      search.set('page', String(page))
      search.set('size', String(size))

      const response = await api.get<MovementListResponse>(
        `/inventory/stocks/movements?${search.toString()}`,
      )
      return response.data
    },
    queryKey: movementListQueryKey(params),
    staleTime: 30_000,
  })
}
