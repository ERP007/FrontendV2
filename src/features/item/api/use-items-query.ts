import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { PageResponse } from '@/shared/api'

import { ITEM_UNIT_OPTIONS } from '../model/types'

import type { Item, ItemFilter, ItemListItem, ItemUnit } from '../model/types'

const ITEM_QUERY_KEY = ['items'] as const

function toItemUnit(unit: string): ItemUnit {
  return ITEM_UNIT_OPTIONS.includes(unit as ItemUnit) ? (unit as ItemUnit) : 'EA'
}

function toItem(row: ItemListItem): Item {
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

function resolveCategoryCode(filter: ItemFilter) {
  if (filter.middleCategory !== 'ALL') {
    return filter.middleCategory
  }

  if (filter.majorCategory !== 'ALL') {
    return filter.majorCategory
  }

  return undefined
}

function buildItemListQueryParams(filter: ItemFilter, page: number, size: number) {
  const queryParams: Record<string, number | string> = {
    page,
    size,
    sort: filter.sort,
  }

  const keyword = filter.keyword.trim()
  const categoryCode = resolveCategoryCode(filter)

  if (keyword) queryParams.search = keyword
  if (categoryCode) queryParams.categoryCode = categoryCode
  if (filter.status !== 'ALL') queryParams.status = filter.status

  return queryParams
}

export function useItemsQuery(filter: ItemFilter, page: number, size: number) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.get<PageResponse<ItemListItem>>('/items', {
        params: buildItemListQueryParams(filter, page, size),
      })

      return { ...response.data, content: response.data.content.map(toItem) }
    },
    queryKey: [...ITEM_QUERY_KEY, filter, page, size],
  })
}

export interface UseItemsInfiniteQueryOptions {
  enabled?: boolean
  search?: string
}

const itemsInfiniteQueryKey = (params: Omit<UseItemsInfiniteQueryOptions, 'enabled'>) =>
  ['items', 'infinite', params] as const

export function useItemsInfiniteQuery({ enabled, ...params }: UseItemsInfiniteQueryOptions = {}) {
  return useInfiniteQuery<
    PageResponse<ItemListItem>,
    Error,
    InfiniteData<PageResponse<ItemListItem>>,
    ReturnType<typeof itemsInfiniteQueryKey>,
    number
  >({
    enabled,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await api.get<PageResponse<ItemListItem>>('/items', {
        params: { ...params, page: pageParam },
      })
      return response.data
    },
    queryKey: itemsInfiniteQueryKey(params),
    staleTime: 60_000,
  })
}
