import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { CreateSalesOrderRequest, CreateSalesOrderResponse } from '../model/types'
import { invalidateSalesOrderCollections } from './so-cache'

/** SO #1 생성(즉시 제출) — POST /sales-orders */
export function useCreateSalesOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateSalesOrderRequest) => {
      const response = await api.post<CreateSalesOrderResponse>('/sales-orders', payload)
      return response.data
    },
    onSuccess: () => {
      invalidateSalesOrderCollections(queryClient)
    },
  })
}
