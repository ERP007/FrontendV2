import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { ItemSkuCheckResult } from '../model/types'

function toSkuCheckRequest(sku: string) {
  return {
    sku: sku.trim(),
  }
}

export function useItemSkuCheckMutation() {
  return useMutation({
    mutationFn: async (sku: string) => {
      const response = await api.post<ItemSkuCheckResult>('/items/code-check', toSkuCheckRequest(sku))

      return response.data
    },
  })
}
