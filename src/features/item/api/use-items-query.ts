import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import {
  ITEM_CATEGORY_CODE_BY_NAME,
  ITEM_UNIT_OPTIONS,
} from '../model/types'

import type { Item, ItemListParams, ItemListResponse, ItemUnit } from '../model/types'

const ITEM_QUERY_KEY = ['items'] as const

interface ItemListRowApiResponse {
  active: boolean
  categoryCode: string
  categoryName: string
  createdAt: string
  name: string
  parentCategoryCode: string | null
  parentCategoryName: string | null
  safetyStock: number
  sku: string
  unit: string
  unitPrice: number
  updatedAt: string
}

interface ItemListApiResponse {
  content: ItemListRowApiResponse[]
  hasNext: boolean
  hasPrevious: boolean
  page: number
  size: number
  totalElements: number
  totalPages: number
}

function toItemUnit(unit: string): ItemUnit {
  return ITEM_UNIT_OPTIONS.includes(unit as ItemUnit) ? (unit as ItemUnit) : 'EA'
}

function toItem(row: ItemListRowApiResponse): Item {
  return {
    active: row.active,
    code: row.sku,
    createdAt: row.createdAt,
    defaultSafetyStock: row.safetyStock,
    description: null,
    id: row.sku,
    majorCategory: row.parentCategoryName ?? row.categoryName,
    middleCategory: row.parentCategoryName ? row.categoryName : '',
    name: row.name,
    unit: toItemUnit(row.unit),
    updatedAt: row.updatedAt,
  }
}

function toItemListResponse(response: ItemListApiResponse): ItemListResponse {
  return {
    content: response.content.map(toItem),
    page: response.page,
    size: response.size,
    totalElements: response.totalElements,
    totalPages: response.totalPages,
  }
}

function resolveCategoryCode(params: ItemListParams) {
  if (params.middleCategory !== 'ALL') {
    return ITEM_CATEGORY_CODE_BY_NAME[params.middleCategory]
  }

  if (params.majorCategory !== 'ALL') {
    return ITEM_CATEGORY_CODE_BY_NAME[params.majorCategory]
  }

  return undefined
}

function buildItemListQueryParams(params: ItemListParams) {
  const queryParams: Record<string, number | string> = {
    page: params.page,
    size: params.size,
    sort: params.sort === 'code' ? 'sku,asc' : 'updatedAt,desc',
  }

  const keyword = params.keyword.trim()
  const categoryCode = resolveCategoryCode(params)

  if (keyword) queryParams.search = keyword
  if (categoryCode) queryParams.categoryCode = categoryCode
  if (params.status !== 'ALL') queryParams.status = params.status

  return queryParams
}

export function useItemsQuery(params: ItemListParams) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.get<ItemListApiResponse>('/items', {
        params: buildItemListQueryParams(params),
      })

      return toItemListResponse(response.data)
    },
    queryKey: [...ITEM_QUERY_KEY, params],
  })
}
