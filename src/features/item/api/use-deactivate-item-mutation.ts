import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api'

interface ItemStatusChangeResponse {
  active: boolean
  name: string
  sku: string
  updatedAt: string
}

export function useDeactivateItemMutation() {
  return useMutation({
    mutationFn: async (sku: string) => {
      const response = await api.patch<ItemStatusChangeResponse>(
        `/items/${encodeURIComponent(sku)}/deactivate`,
      )

      return response.data
    },
  })
}

export function useActivateItemMutation() {
  return useMutation({
    mutationFn: async (sku: string) => {
      const response = await api.patch<ItemStatusChangeResponse>(
        `/items/${encodeURIComponent(sku)}/activate`,
      )

      return response.data
    },
  })
}
