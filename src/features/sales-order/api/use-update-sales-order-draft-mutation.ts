import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { SalesOrderStatusChangedResponse, UpdateDraftSalesOrderRequest } from '../model/types'
import { invalidateSalesOrder } from './so-cache'

/** SO #3 임시저장 수정(덮어쓰기) — PUT /sales-orders/drafts/{code} */
export function useUpdateSalesOrderDraftMutation(code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateDraftSalesOrderRequest) => {
      const response = await api.put<SalesOrderStatusChangedResponse>(
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
