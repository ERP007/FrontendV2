import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { SafetyStockEdit } from '../model/types'

export interface SafetyStockTarget {
  sku: string
  warehouseCode: string
}

/**
 * 안전재고 조정 모달 프리필을 조회한다(GET /inventory/stocks/{warehouseCode}/{sku}/safety-stock).
 * 낙관적 락용 version을 포함하므로 항상 최신을 받도록 staleTime 0. ADMIN·HQ_MANAGER 전용.
 */
export function useSafetyStockEditQuery(target: SafetyStockTarget | null) {
  return useQuery({
    enabled: Boolean(target),
    queryFn: async () => {
      const response = await api.get<SafetyStockEdit>(
        `/inventory/stocks/${encodeURIComponent(target!.warehouseCode)}/${encodeURIComponent(target!.sku)}/safety-stock`,
      )
      return response.data
    },
    queryKey: ['stocks', 'safety-stock', target?.warehouseCode, target?.sku] as const,
    staleTime: 0,
  })
}
