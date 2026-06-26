import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { stockQueryBaseKey } from './stock-cache'

export interface StockQuantity {
  quantity: number
  safetyStock: number
  sku: string
}

interface StockQuantitiesResponse {
  stocks: StockQuantity[]
  warehouseCode: string
}

const stockQuantitiesQueryBaseKey = [...stockQueryBaseKey, 'quantities'] as const

/** 특정 창고의 여러 SKU 현재고 일괄 조회(GET /inventory/stocks/quantities). */
export function stockQuantitiesQueryOptions(warehouseCode: string, skus: string[]) {
  return queryOptions({
    queryFn: async () => {
      const response = await api.get<StockQuantitiesResponse>('/inventory/stocks/quantities', {
        params: { skus, warehouseCode },
      })
      return response.data
    },
    queryKey: [...stockQuantitiesQueryBaseKey, warehouseCode, [...skus].sort()] as const,
    staleTime: 0,
  })
}

/** sku → 재고 Map 으로 변환해 라인 매칭을 쉽게 한다. */
export function useStockQuantitiesQuery(warehouseCode: string | undefined, skus: string[]) {
  return useQuery({
    ...stockQuantitiesQueryOptions(warehouseCode ?? '', skus),
    enabled: Boolean(warehouseCode) && skus.length > 0,
    select: (data) => new Map(data.stocks.map((stock) => [stock.sku, stock])),
  })
}
