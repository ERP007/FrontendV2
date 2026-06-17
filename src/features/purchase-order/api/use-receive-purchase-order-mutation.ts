import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  ReceivePurchaseOrderRequest,
  ReceivePurchaseOrderResponse,
} from '../model/types'

export interface ReceivePurchaseOrderVariables {
  code: string
  payload: ReceivePurchaseOrderRequest
}

export function useReceivePurchaseOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ code, payload }: ReceivePurchaseOrderVariables) => {
      const response = await api.patch<ReceivePurchaseOrderResponse>(
        `/procurement-orders/${code}/receive`,
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
