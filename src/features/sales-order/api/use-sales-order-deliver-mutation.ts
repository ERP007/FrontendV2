import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { DeliverSalesOrderRequest, SalesOrderStatusChangedResponse } from '../model/types'
import { invalidateSalesOrder } from './so-cache'

/** SO #9 입고 처리(BRANCH) — PATCH /sales-orders/{code}/deliver. 응답 progress 가 INBOUND_IN_PROGRESS 면 진행 폴링. */
export function useSalesOrderDeliverMutation(code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: DeliverSalesOrderRequest) => {
      const response = await api.patch<SalesOrderStatusChangedResponse>(
        `/sales-orders/${code}/deliver`,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      invalidateSalesOrder(queryClient, code)
    },
  })
}
