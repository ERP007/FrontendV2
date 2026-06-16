import { useMutation } from '@tanstack/react-query'

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
  return useMutation({
    mutationFn: async ({ code, payload }: CancelPurchaseOrderVariables) => {
      const response = await api.patch<CancelPurchaseOrderResponse>(
        `/procurement-orders/${code}/cancel`,
        payload,
      )
      return response.data
    },
  })
}
