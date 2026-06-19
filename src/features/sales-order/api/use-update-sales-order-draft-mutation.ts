import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { CreateDraftSalesOrderRequest, CreateSalesOrderResponse } from '../model/types'
import { invalidateSalesOrder } from './so-cache'

/** SO 임시저장 수정(덮어쓰기) — PUT /sales-orders/drafts/{code} */
export function useUpdateSalesOrderDraftMutation(code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateDraftSalesOrderRequest) => {
      const response = await api.put<CreateSalesOrderResponse>(
        `/sales-orders/drafts/${code}`,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      invalidateSalesOrder(queryClient, code)
    },
  })
}
