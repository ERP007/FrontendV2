import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { ItemCategory, ItemSubCategory } from '../model/types'

const ITEM_CATEGORIES_QUERY_KEY = ['item-categories'] as const

function sortByDisplayOrder<T extends { categoryName: string; displayOrder: number }>(items: T[]) {
  return [...items].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.categoryName.localeCompare(b.categoryName, 'ko'),
  )
}

export function useItemCategoriesQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<ItemCategory[]>('/items/categories')

      return sortByDisplayOrder(response.data)
    },
    queryKey: ITEM_CATEGORIES_QUERY_KEY,
  })
}

export function useItemSubCategoriesQuery(categoryCode: string | undefined) {
  const enabled = Boolean(categoryCode && categoryCode !== 'ALL')

  return useQuery({
    enabled,
    queryFn: async () => {
      if (!categoryCode || categoryCode === 'ALL') {
        return []
      }

      const response = await api.get<ItemSubCategory[]>(
        `/items/categories/${categoryCode}/sub-categories`,
      )

      return sortByDisplayOrder(response.data)
    },
    queryKey: [...ITEM_CATEGORIES_QUERY_KEY, categoryCode, 'sub-categories'],
  })
}
