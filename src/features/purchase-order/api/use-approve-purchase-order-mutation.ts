import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { ApprovePurchaseOrderResponse } from '../model/types'

export function useApprovePurchaseOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await api.patch<ApprovePurchaseOrderResponse>(
        `/procurement-orders/${code}/approve`,
      )
      return response.data
    },
    onSuccess: (_data, code) => {
      void queryClient.invalidateQueries({ queryKey: ['purchase-orders', 'detail', code] })
      void queryClient.invalidateQueries({ queryKey: ['purchase-orders', 'histories', code] })
      void queryClient.invalidateQueries({ queryKey: ['purchase-orders', 'kpi'] })
      void queryClient.invalidateQueries({ queryKey: ['purchase-orders', 'list'] })
    },
  })
}
