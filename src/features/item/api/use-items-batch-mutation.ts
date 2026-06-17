import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { ItemBatchRequest, ItemBatchResponse } from '../model/types'

export function useItemsBatchMutation() {
  return useMutation({
    mutationFn: async (skus: string[]) => {
      const payload: ItemBatchRequest = { skus }
      const response = await api.post<ItemBatchResponse>('/items/batch', payload)

      return response.data
    },
  })
}
