import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { CancelSalesOrderRequest, SalesOrderStatusChangedResponse } from '../model/types'
import { invalidateSalesOrder } from './so-cache'

/** SO #8 취소(BRANCH) — PATCH /sales-orders/{code}/cancel */
export function useCancelSalesOrderMutation(code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CancelSalesOrderRequest) => {
      const response = await api.patch<SalesOrderStatusChangedResponse>(
        `/sales-orders/${code}/cancel`,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      invalidateSalesOrder(queryClient, code)
    },
  })
}
