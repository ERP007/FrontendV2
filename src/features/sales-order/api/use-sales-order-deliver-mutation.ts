import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { DeliverSalesOrderRequest, DeliverSalesOrderResponse } from '../model/types'
import { invalidateSalesOrder } from './so-cache'

/** SO #8 도착 확정(BRANCH) — PATCH /sales-orders/{code}/deliver */
export function useSalesOrderDeliverMutation(code: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: DeliverSalesOrderRequest) => {
      const response = await api.patch<DeliverSalesOrderResponse>(
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
