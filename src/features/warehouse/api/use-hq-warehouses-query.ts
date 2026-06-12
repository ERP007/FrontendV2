import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { HqWarehouseSummary } from '../model/types'

interface HqWarehousesResponse {
  content: HqWarehouseSummary[]
}

const hqWarehousesQueryKey = ['warehouses', 'hq'] as const

export function useHqWarehousesQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<HqWarehousesResponse>('/inventory/warehouses/hq')

      return response.data.content
    },
    queryKey: hqWarehousesQueryKey,
    staleTime: 60_000,
  })
}
