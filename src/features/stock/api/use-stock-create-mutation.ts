import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { invalidateStockQueries } from './stock-cache'

import type { StockCreateFormValues } from '../model/types'

/**
 * (sku × 창고) 재고 행을 신규 생성한다(POST /inventory/stocks). ADMIN 전용.
 * 입출고 흐름 밖에서 초기 데이터 적재용이며, 성공 시 재고 조회 캐시를 무효화한다.
 */
export function useStockCreateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: StockCreateFormValues) => {
      await api.post('/inventory/stocks', {
        itemName: values.itemName,
        itemUnit: values.itemUnit,
        quantity: values.quantity,
        safetyStock: values.safetyStock,
        sku: values.sku,
        warehouseCode: values.warehouseCode,
      })
    },
    onSuccess: () => {
      invalidateStockQueries(queryClient)
    },
  })
}
