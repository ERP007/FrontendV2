import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { ApproveSalesOrderRequest, SalesOrderStatusChangedResponse } from '../model/types'
import { invalidateSalesOrder } from './so-cache'

/** SO #6 승인(HQ) — PATCH /sales-orders/{code}/approve. 응답 progress 가 OUTBOUND_IN_PROGRESS 면 진행 폴링. */
export function useApproveSalesOrderMutation(code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ApproveSalesOrderRequest) => {
      const response = await api.patch<SalesOrderStatusChangedResponse>(
        `/sales-orders/${code}/approve`,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      invalidateSalesOrder(queryClient, code)
    },
  })
}
