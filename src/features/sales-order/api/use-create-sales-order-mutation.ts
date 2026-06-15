import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  CreateSalesOrderDraftRequest,
  SalesOrderDraftResponse,
} from './use-create-sales-order-draft-mutation'

export type CreateSalesOrderRequest = CreateSalesOrderDraftRequest
export type SalesOrderResponse = SalesOrderDraftResponse

export function useCreateSalesOrderMutation() {
  return useMutation({
    mutationFn: async (payload: CreateSalesOrderRequest) => {
      const response = await api.post<SalesOrderResponse>('/sales-orders', payload)
      return response.data
    },
  })
}
