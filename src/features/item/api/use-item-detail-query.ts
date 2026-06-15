import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { ITEM_UNIT_OPTIONS } from '../model/types'

import type { ItemDetail, ItemUnit } from '../model/types'

export const itemDetailQueryKey = (sku: string) => ['items', sku, 'detail'] as const

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

export function useItemDetailQuery(sku: string | null) {
  return useQuery({
    enabled: Boolean(sku),
    queryFn: async () => {
      if (!sku) {
        throw new Error('SKU is required.')
      }

      const response = await api.get<ItemDetailApiResponse>(`/items/${encodeURIComponent(sku)}`)

      return toItemDetail(response.data)
    },
    queryKey: sku ? itemDetailQueryKey(sku) : ['items', 'detail', 'empty'],
  })
}
