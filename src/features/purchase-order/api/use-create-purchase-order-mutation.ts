import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  CreatePurchaseOrderRequest,
  CreatePurchaseOrderResponse,
} from '../model/types'

export function useCreatePurchaseOrderMutation() {
  return useMutation({
    mutationFn: async (payload: CreatePurchaseOrderRequest) => {
      const response = await api.post<CreatePurchaseOrderResponse>(
        '/procurement-orders',
        payload,
      )
      return response.data
    },
  })
}
