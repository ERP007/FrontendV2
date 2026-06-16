import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { SalesOrderStatus, SoPriority } from '../model/types'

export interface SalesOrderDraftLinePayload {
  itemCode: string
  priority: SoPriority
  quantity: number
}

export interface CreateSalesOrderDraftRequest {
  desiredArrivalDate: string
  lines: SalesOrderDraftLinePayload[]
  memo?: string
  warehouseCode: string
}

export interface SalesOrderDraftResponse {
  code: string
  createdAt: string
  desiredArrivalDate: string
  fromWarehouseCode: string
  status: SalesOrderStatus
  toWarehouseCode: string
  totalQuantity: number
}

export function useCreateSalesOrderDraftMutation() {
  return useMutation({
    mutationFn: async (payload: CreateSalesOrderDraftRequest) => {
      const response = await api.post<SalesOrderDraftResponse>('/sales-orders/drafts', payload)
      return response.data
    },
  })
}
