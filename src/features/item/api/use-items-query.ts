import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { PageResponse } from '@/shared/api'

import type { ItemListItem, ItemListParams } from '../model/types'

const itemsQueryKey = (params: ItemListParams) => ['items', params] as const

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
