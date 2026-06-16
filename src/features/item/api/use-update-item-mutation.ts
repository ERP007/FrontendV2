import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { ITEM_UNIT_OPTIONS } from '../model/types'

import type { ItemDetail, ItemDetailFormValues, ItemUnit, UpdateItemRequest } from '../model/types'

interface UpdateItemVariables {
  sku: string
  values: ItemDetailFormValues
}

interface ItemDetailApiResponse {
  active: boolean
  categoryCode: string
  categoryName: string
  createdAt: string
  name: string
  safetyStock: number
  sku: string
  subCategoryCode: string
  subCategoryName: string
  unit: string
  unitPrice: number
  updatedAt: string
}

function toItemUnit(unit: string): ItemUnit {
  return ITEM_UNIT_OPTIONS.includes(unit as ItemUnit) ? (unit as ItemUnit) : 'EA'
}

function toItemDetail(response: ItemDetailApiResponse): ItemDetail {
  return {
    active: response.active,
    categoryCode: response.categoryCode,
    categoryName: response.categoryName,
    createdAt: response.createdAt,
    name: response.name,
    safetyStock: response.safetyStock,
    sku: response.sku,
    subCategoryCode: response.subCategoryCode,
    subCategoryName: response.subCategoryName,
    unit: toItemUnit(response.unit),
    unitPrice: response.unitPrice,
    updatedAt: response.updatedAt,
  }
}

function toUpdateItemRequest(values: ItemDetailFormValues): UpdateItemRequest {
  return {
    categoryCode: values.categoryCode,
    name: values.name.trim(),
    safetyStock: values.safetyStock,
    subCategoryCode: values.subCategoryCode,
    unit: values.unit,
    unitPrice: values.unitPrice,
  }
}

export function useUpdateItemMutation() {
  return useMutation({
    mutationFn: async ({ sku, values }: UpdateItemVariables) => {
      const response = await api.patch<ItemDetailApiResponse>(
        `/items/${encodeURIComponent(sku)}`,
        toUpdateItemRequest(values),
      )

      return toItemDetail(response.data)
    },
  })
}
