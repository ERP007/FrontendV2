import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  CreatePurchaseOrderResponse,
  DraftPurchaseOrderRequest,
} from '../model/types'

export interface UpdatePurchaseOrderVariables {
  code: string
  payload: DraftPurchaseOrderRequest
}

export function useUpdatePurchaseOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ code, payload }: UpdatePurchaseOrderVariables) => {
      const response = await api.put<CreatePurchaseOrderResponse>(
        `/procurement-orders/${code}`,
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
