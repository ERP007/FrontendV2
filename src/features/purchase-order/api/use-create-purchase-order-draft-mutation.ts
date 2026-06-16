import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  CreatePurchaseOrderResponse,
  DraftPurchaseOrderRequest,
} from '../model/types'

export function useCreatePurchaseOrderDraftMutation() {
  return useMutation({
    mutationFn: async (payload: DraftPurchaseOrderRequest) => {
      const response = await api.post<CreatePurchaseOrderResponse>(
        '/procurement-orders/drafts',
        payload,
      )
      return response.data
    },
  })
}
