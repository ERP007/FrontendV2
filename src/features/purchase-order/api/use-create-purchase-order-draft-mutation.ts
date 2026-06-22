import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  CreatePurchaseOrderResponse,
  DraftPurchaseOrderRequest,
} from '../model/types'
import { invalidatePurchaseOrderCollections } from './po-cache'

export function useCreatePurchaseOrderDraftMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: DraftPurchaseOrderRequest) => {
      const response = await api.post<CreatePurchaseOrderResponse>(
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
