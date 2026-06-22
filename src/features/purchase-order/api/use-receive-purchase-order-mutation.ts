import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  ReceivePurchaseOrderRequest,
  ReceivePurchaseOrderResponse,
} from '../model/types'
import { invalidatePurchaseOrder } from './po-cache'

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
      invalidatePurchaseOrder(queryClient, variables.code)
    },
  })
}
