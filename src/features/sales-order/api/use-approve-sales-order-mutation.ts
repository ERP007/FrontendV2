import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { ApproveSalesOrderRequest, ApproveSalesOrderResponse } from '../model/types'
import { invalidateSalesOrder } from './so-cache'

/** SO #5 승인(HQ) — PATCH /sales-orders/{code}/approve */
export function useApproveSalesOrderMutation(code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ApproveSalesOrderRequest) => {
      const response = await api.patch<ApproveSalesOrderResponse>(
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
