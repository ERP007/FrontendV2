import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { invalidateStockQueries } from './stock-cache'

export interface SafetyStockUpdateInput {
  safetyStock: number
  sku: string
  version: number
  warehouseCode: string
}

/**
 * 안전재고를 수정한다(PATCH /inventory/stocks/{warehouseCode}/{sku}/safety-stock). ADMIN·HQ_MANAGER 전용.
 * safetyStock 절대값으로 교체하고 version으로 낙관적 락을 검증한다.
 * 안전재고 변경은 상태(부족/충분)에 영향을 주므로 재고 조회 캐시를 무효화한다.
 */
export function useSafetyStockMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ safetyStock, sku, version, warehouseCode }: SafetyStockUpdateInput) => {
      await api.patch(
        `/inventory/stocks/${encodeURIComponent(warehouseCode)}/${encodeURIComponent(sku)}/safety-stock`,
        { safetyStock, version },
      )
    },
    onSuccess: () => {
      invalidateStockQueries(queryClient)
    },
  })
}
