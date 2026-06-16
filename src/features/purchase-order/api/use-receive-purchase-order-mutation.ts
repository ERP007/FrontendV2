import { useMutation } from '@tanstack/react-query'

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
  return useMutation({
    mutationFn: async ({ code, payload }: ReceivePurchaseOrderVariables) => {
      const response = await api.patch<ReceivePurchaseOrderResponse>(
        `/procurement-orders/${code}/receive`,
        payload,
      )
      return response.data
    },
  })
}
