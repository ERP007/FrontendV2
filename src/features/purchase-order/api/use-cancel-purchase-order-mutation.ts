import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  CancelPurchaseOrderRequest,
  CancelPurchaseOrderResponse,
} from '../model/types'

export interface CancelPurchaseOrderVariables {
  code: string
  payload: CancelPurchaseOrderRequest
}

export function useCancelPurchaseOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ code, payload }: CancelPurchaseOrderVariables) => {
      const response = await api.patch<CancelPurchaseOrderResponse>(
        `/procurement-orders/${code}/cancel`,
        payload,
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['purchase-orders', 'detail', variables.code],
      })
      void queryClient.invalidateQueries({
        queryKey: ['purchase-orders', 'histories', variables.code],
      })
      void queryClient.invalidateQueries({ queryKey: ['purchase-orders', 'kpi'] })
      void queryClient.invalidateQueries({ queryKey: ['purchase-orders', 'list'] })
    },
  })
}
