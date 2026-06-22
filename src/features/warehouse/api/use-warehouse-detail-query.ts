import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { Warehouse } from '../model/types'

/**
 * 창고 단건 상세를 조회한다(swagger GET /inventory/warehouses/{code}).
 *
 * 목록 응답에 없는 branchId·address·version까지 포함하므로 수정 모달 프리필에 사용한다.
 * code가 없으면(enabled=false) 호출하지 않는다.
 */
export function useWarehouseDetailQuery(code: string | null) {
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<Warehouse>(`/inventory/warehouses/${code}`)
      return response.data
    },
    queryKey: ['warehouses', 'detail', code] as const,
    staleTime: 60_000,
  })
}
