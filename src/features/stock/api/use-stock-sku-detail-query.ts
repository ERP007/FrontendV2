import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { stockQueryBaseKey } from './stock-cache'

import type { StockSkuDetail } from '../model/types'

const stockSkuDetailQueryBaseKey = [...stockQueryBaseKey, 'detail'] as const

/**
 * sku 상세 패널을 조회한다(GET /inventory/stocks/{sku}).
 * 창고별 재고·상태, 전체 합계, 최근 이동 5건을 포함한다. sku가 없으면(enabled=false) 호출하지 않는다.
 * BRANCH는 자기 지점 창고분만 집계된다.
 */
export function useStockSkuDetailQuery(sku: string | null) {
  return useQuery({
    enabled: Boolean(sku),
    queryFn: async () => {
      const response = await api.get<StockSkuDetail>(
        `/inventory/stocks/${encodeURIComponent(sku ?? '')}`,
      )
      return response.data
    },
    queryKey: [...stockSkuDetailQueryBaseKey, sku] as const,
    staleTime: 0,
  })
}
