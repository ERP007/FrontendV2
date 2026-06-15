import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { CreateItemRequest, CreateItemResponse, ItemFormValues } from '../model/types'

function toCreateItemRequest(values: ItemFormValues): CreateItemRequest {
  return {
    categoryCode: values.categoryCode,
    name: values.name.trim(),
    safetyStock: values.safetyStock,
    sku: values.sku.trim(),
    unit: values.unit,
    unitPrice: values.unitPrice,
  }
}

export function useCreateItemMutation() {
  return useMutation({
    mutationFn: async (values: ItemFormValues) => {
      const response = await api.post<CreateItemResponse>('/items', toCreateItemRequest(values))

      return response.data
    },
  })
}
