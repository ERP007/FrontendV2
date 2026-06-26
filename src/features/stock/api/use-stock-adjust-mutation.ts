import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { invalidateStockQueries } from './stock-cache'

import type { AdjustmentFormValues } from '../model/types'

export interface StockAdjustInput extends AdjustmentFormValues {
  sku: string
}

/**
 * 재고를 조정한다(POST /inventory/stocks/adjustments). ADMIN·HQ_MANAGER 전용.
 * 수행자(사번·이름)는 백엔드가 토큰에서 채운다.
 * 성공 시 재고 조회 캐시를 무효화해 최신 수량/상태를 반영한다.
 */
export function useStockAdjustMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: StockAdjustInput) => {
      await api.post('/inventory/stocks/adjustments', {
        adjustmentType: input.adjustmentType,
        note: input.note,
        quantity: input.quantity,
        reason: input.reason,
        sku: input.sku,
        warehouseCode: input.warehouseCode,
      })
    },
    onSuccess: () => {
      invalidateStockQueries(queryClient)
    },
  })
}
