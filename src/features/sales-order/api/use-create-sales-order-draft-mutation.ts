import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { CreateDraftSalesOrderRequest, CreateSalesOrderResponse } from '../model/types'
import { invalidateSalesOrderCollections } from './so-cache'

/** SO #2 임시저장 — POST /sales-orders/drafts */
export function useCreateSalesOrderDraftMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateDraftSalesOrderRequest) => {
      const response = await api.post<CreateSalesOrderResponse>('/sales-orders/drafts', payload)
      return response.data
    },
    onSuccess: () => {
      invalidateSalesOrderCollections(queryClient)
    },
  })
}
