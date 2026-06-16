import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { SalesOrderStatus } from '../model/types'

export interface DeliverSalesOrderRequest {
  deliveredDate: string
}

export interface DeliverSalesOrderResponse {
  code: string
  deliveredAt: string
  deliveredDate: string
  fromWarehouseCode: string
  status: SalesOrderStatus
  toWarehouseCode: string
  totalQuantity: number
}

export function useSalesOrderDeliverMutation(code: string) {
  return useMutation({
    mutationFn: async (payload: DeliverSalesOrderRequest) => {
      const response = await api.patch<DeliverSalesOrderResponse>(
        `/sales-orders/${code}/deliver`,
        payload,
      )
      return response.data
    },
  })
}
