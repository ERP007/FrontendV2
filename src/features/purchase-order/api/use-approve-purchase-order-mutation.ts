import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { ApprovePurchaseOrderResponse } from '../model/types'

export function useApprovePurchaseOrderMutation() {
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await api.patch<ApprovePurchaseOrderResponse>(
        `/procurement-orders/${code}/approve`,
      )
      return response.data
    },
  })
}
