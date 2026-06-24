import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { PurchaseOrderStatusResponse } from '../model/types'
import { invalidatePurchaseOrder } from './po-cache'

export function useApprovePurchaseOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await api.patch<PurchaseOrderStatusResponse>(
        `/procurement-orders/${code}/approve`,
      )
      return response.data
    },
    onSuccess: (_data, code) => {
      invalidatePurchaseOrder(queryClient, code)
    },
  })
}
