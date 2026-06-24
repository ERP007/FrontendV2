import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { RejectSalesOrderRequest, SalesOrderStatusChangedResponse } from '../model/types'
import { invalidateSalesOrder } from './so-cache'

/** SO #7 거절(HQ) — PATCH /sales-orders/{code}/reject */
export function useRejectSalesOrderMutation(code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: RejectSalesOrderRequest) => {
      const response = await api.patch<SalesOrderStatusChangedResponse>(
        `/sales-orders/${code}/reject`,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      invalidateSalesOrder(queryClient, code)
    },
  })
}
