import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { PageResponse } from '@/shared/api'

import type { ItemListItem, ItemListParams } from '../model/types'

const itemsQueryKey = (params: ItemListParams) => ['items', params] as const
const itemsInfiniteQueryKey = (params: Omit<ItemListParams, 'page'>) =>
  ['items', 'infinite', params] as const

export function useItemsQuery(params: ItemListParams = {}) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await api.get<PageResponse<ItemListItem>>('/items', { params })
      return response.data
    },
    queryKey: itemsQueryKey(params),
    staleTime: 60_000,
  })
}

export interface UseItemsInfiniteQueryOptions extends Omit<ItemListParams, 'page'> {
  enabled?: boolean
}

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
