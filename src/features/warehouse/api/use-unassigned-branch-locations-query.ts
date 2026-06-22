import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { BranchLocation } from '../model/types'

/** GET /inventory/branch-locations/unassigned 응답 (swagger BranchLocationListResponse) */
interface BranchLocationListResponse {
  content: BranchLocation[]
}

export const unassignedBranchLocationsQueryKey = ['branch-locations', 'unassigned'] as const

/**
 * 아직 어느 창고에도 할당되지 않은 지점 목록을 조회한다(창고 등록 모달의 소속 지점 드롭다운용).
 * 지점↔창고는 1:1이라 등록 시 미할당 지점만 선택할 수 있다. 폼을 열 때만 호출한다(enabled).
 */
export function useUnassignedBranchLocationsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await api.get<BranchLocationListResponse>(
        '/inventory/branch-locations/unassigned',
      )
      return response.data.content
    },
    queryKey: unassignedBranchLocationsQueryKey,
    staleTime: 60_000,
  })
}
