import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { stockQueryBaseKey } from './stock-cache'

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

const stockDetailQueryBaseKey = [...stockQueryBaseKey, 'warehouse-detail'] as const

export function stockDetailQueryOptions({ sku, warehouseCode }: UseStockDetailQueryParams) {
  return queryOptions({
    queryFn: async () => {
      const response = await api.get<StockDetail>(`/inventory/stocks/${warehouseCode}/${sku}`)
      return response.data
    },
    queryKey: [...stockDetailQueryBaseKey, warehouseCode, sku] as const,
    staleTime: 0,
  })
}

export function useStockDetailQuery(params: UseStockDetailQueryParams) {
  return useQuery(stockDetailQueryOptions(params))
}
