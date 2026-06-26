import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  PurchaseOrderStatusResponse,
  DraftPurchaseOrderRequest,
} from '../model/types'
import { invalidatePurchaseOrderCollections } from './po-cache'

export function useCreatePurchaseOrderDraftMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: DraftPurchaseOrderRequest) => {
      const response = await api.post<PurchaseOrderStatusResponse>(
        '/procurement-orders/drafts',
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      invalidatePurchaseOrderCollections(queryClient)
    },
  })
}
