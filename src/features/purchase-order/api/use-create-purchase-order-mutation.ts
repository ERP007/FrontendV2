import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  CreatePurchaseOrderRequest,
  CreatePurchaseOrderResponse,
} from '../model/types'
import { invalidatePurchaseOrderCollections } from './po-cache'

export function useCreatePurchaseOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreatePurchaseOrderRequest) => {
      const response = await api.post<CreatePurchaseOrderResponse>(
        '/procurement-orders',
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      invalidatePurchaseOrderCollections(queryClient)
    },
  })
}
