import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { StockKpi } from '../model/types'

export const stockKpiQueryKey = ['stocks', 'kpi'] as const

const emptyStockKpi: StockKpi = {
  lowStockCount: 0,
  noStockCount: 0,
  recentAdjustCount: 0,
  totalSkuCount: 0,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toFiniteNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function normalizeStockKpi(value: unknown): StockKpi {
  const data = isRecord(value) && 'content' in value ? value.content : value
  if (!isRecord(data)) return emptyStockKpi

  const normalized: StockKpi = {
    lowStockCount: toFiniteNumber(data.lowStockCount),
    noStockCount: toFiniteNumber(data.noStockCount),
    recentAdjustCount: toFiniteNumber(data.recentAdjustCount),
    totalSkuCount: toFiniteNumber(data.totalSkuCount),
  }

  if (typeof data.fulfillmentRate === 'number' && Number.isFinite(data.fulfillmentRate)) {
    normalized.fulfillmentRate = data.fulfillmentRate
  }

  return normalized
}

/**
 * 재고 KPI를 조회한다(GET /inventory/stocks/kpi).
 * 집계 범위는 호출자 소속으로 강제된다(BRANCH는 자기 지점 창고).
 */
export function useStockKpiQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<unknown>('/inventory/stocks/kpi')
      return normalizeStockKpi(response.data)
    },
    queryKey: stockKpiQueryKey,
    staleTime: 60_000,
  })
}
