import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { SalesOrderStatusChangedResponse, SubmitSalesOrderRequest } from '../model/types'
import { invalidateSalesOrder } from './so-cache'

/** SO #4 제출(임시저장 → 요청 본문 덮어쓰기) — PUT /sales-orders/{code} */
export function useSubmitSalesOrderMutation(code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: SubmitSalesOrderRequest) => {
      const response = await api.put<SalesOrderStatusChangedResponse>(
        `/sales-orders/${code}`,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      invalidateSalesOrder(queryClient, code)
    },
  })
}
