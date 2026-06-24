import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  CreatePurchaseOrderRequest,
  PurchaseOrderStatusResponse,
} from '../model/types'
import { invalidatePurchaseOrderCollections } from './po-cache'

export function useCreatePurchaseOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreatePurchaseOrderRequest) => {
      const response = await api.post<PurchaseOrderStatusResponse>(
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
