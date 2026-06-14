import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { ITEM_UNIT_OPTIONS } from '../model/types'

import type { ItemUnit, ItemUnitOption } from '../model/types'

const ITEM_UNITS_QUERY_KEY = ['item-units'] as const

interface ItemUnitApiResponse {
  name: string
  unit: string
}

function isItemUnit(unit: string): unit is ItemUnit {
  return ITEM_UNIT_OPTIONS.includes(unit as ItemUnit)
}

function toItemUnitOption(row: ItemUnitApiResponse): ItemUnitOption | null {
  if (!isItemUnit(row.unit)) {
    return null
  }

  return {
    name: row.name || row.unit,
    unit: row.unit,
  }
}

function isPresent<T>(value: T | null): value is T {
  return value !== null
}

export function useItemUnitsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await api.get<ItemUnitApiResponse[]>('/items/units')

      return response.data.map(toItemUnitOption).filter(isPresent)
    },
    queryKey: ITEM_UNITS_QUERY_KEY,
  })
}
