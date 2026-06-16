import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { BranchLocation } from '../model/types'

/** GET /inventory/branch-locations 응답 (swagger BranchLocationListResponse) */
interface BranchLocationListResponse {
  content: BranchLocation[]
}

export const branchLocationsQueryKey = ['branch-locations'] as const

/**
 * 지점 목록을 조회한다(창고 등록/수정 폼의 소속 지점 드롭다운용).
 * 드롭다운은 폼을 열 때만 필요하므로 enabled로 호출 시점을 제어한다(화면 진입 시 불필요한 호출 방지).
 */
export function useBranchLocationsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await api.get<BranchLocationListResponse>('/inventory/branch-locations')
      return response.data.content
    },
    queryKey: branchLocationsQueryKey,
    staleTime: 5 * 60_000,
  })
}
