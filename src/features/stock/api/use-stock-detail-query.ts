import { useQuery } from '@tanstack/react-query'

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

const stockDetailQueryKey = (warehouseCode: string, sku: string) =>
  ['stocks', warehouseCode, sku] as const

export function useStockDetailQuery({ sku, warehouseCode }: UseStockDetailQueryParams) {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<StockDetail>(
        `/inventory/stocks/${warehouseCode}/${sku}`,
      )
      return response.data
    },
    queryKey: stockDetailQueryKey(warehouseCode, sku),
    staleTime: 60_000,
  })
}
