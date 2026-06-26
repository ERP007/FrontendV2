import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  CancelPurchaseOrderRequest,
  PurchaseOrderStatusResponse,
} from '../model/types'
import { invalidatePurchaseOrder } from './po-cache'

export interface CancelPurchaseOrderVariables {
  code: string
  payload: CancelPurchaseOrderRequest
}

export function useCancelPurchaseOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ code, payload }: CancelPurchaseOrderVariables) => {
      const response = await api.patch<PurchaseOrderStatusResponse>(
        `/procurement-orders/${code}/cancel`,
        payload,
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      invalidatePurchaseOrder(queryClient, variables.code)
    },
  })
}
