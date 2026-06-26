import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type {
  PurchaseOrderStatusResponse,
  DraftPurchaseOrderRequest,
} from '../model/types'
import { invalidatePurchaseOrder } from './po-cache'

export interface UpdatePurchaseOrderVariables {
  code: string
  payload: DraftPurchaseOrderRequest
}

export function useUpdatePurchaseOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ code, payload }: UpdatePurchaseOrderVariables) => {
      const response = await api.put<PurchaseOrderStatusResponse>(
        `/procurement-orders/${code}`,
        payload,
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      invalidatePurchaseOrder(queryClient, variables.code)
    },
  })
}
