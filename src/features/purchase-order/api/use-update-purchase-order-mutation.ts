import { useMutation } from '@tanstack/react-query'

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
  return useMutation({
    mutationFn: async ({ code, payload }: UpdatePurchaseOrderVariables) => {
      const response = await api.put<CreatePurchaseOrderResponse>(
        `/procurement-orders/${code}`,
        payload,
      )
      return response.data
    },
  })
}
