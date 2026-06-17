import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { RequestSalesOrderResponse } from '../model/types'
import { invalidateSalesOrder } from './so-cache'

/** SO #4 요청 전환(body 없음) — PATCH /sales-orders/{code}/request */
export function useRequestSalesOrderMutation(code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch<RequestSalesOrderResponse>(`/sales-orders/${code}/request`)
      return response.data
    },
    onSuccess: () => {
      invalidateSalesOrder(queryClient, code)
    },
  })
}
