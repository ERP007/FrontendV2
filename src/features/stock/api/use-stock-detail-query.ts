import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

export interface StockDetail {
  quantity: number
  safetyStock: number
  sku: string
  warehouseCode: string
}

export interface UseStockDetailQueryParams {
  sku: string
  warehouseCode: string
}

export function stockDetailQueryOptions({ sku, warehouseCode }: UseStockDetailQueryParams) {
  return queryOptions({
    queryFn: async () => {
      const response = await api.get<StockDetail>(`/inventory/stocks/${warehouseCode}/${sku}`)
      return response.data
    },
    queryKey: ['stocks', warehouseCode, sku] as const,
    staleTime: 60_000,
  })
}

export function useStockDetailQuery(params: UseStockDetailQueryParams) {
  return useQuery(stockDetailQueryOptions(params))
}
