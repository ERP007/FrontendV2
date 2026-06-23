import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { ItemStockRow, ItemStockStatus } from '../model/types'

const ITEM_STOCK_STATUSES = ['NORMAL', 'LOW'] as const satisfies ItemStockStatus[]

interface ItemStockApiRow {
  currentStock: number
  safetyStock: number
  status?: string
  warehouseCode: string
  warehouseName: string
}

interface ItemStocksApiResponse {
  sku: string
  stocks: ItemStockApiRow[]
}

export const itemStocksQueryBaseKey = (sku: string) => ['items', sku, 'stocks'] as const

export const itemStocksQueryKey = (sku: string, warehouseCode?: string) =>
  [...itemStocksQueryBaseKey(sku), warehouseCode || 'ALL'] as const

function normalizeWarehouseCode(warehouseCode?: string) {
  return warehouseCode && warehouseCode !== 'ALL' ? warehouseCode : undefined
}

function toItemStockStatus(status: string | undefined): ItemStockStatus | undefined {
  return ITEM_STOCK_STATUSES.includes(status as ItemStockStatus)
    ? (status as ItemStockStatus)
    : undefined
}

function toItemStockRows(response: ItemStocksApiResponse): ItemStockRow[] {
  return response.stocks.map((stock) => ({
    currentStock: stock.currentStock,
    safetyStock: stock.safetyStock,
    status: toItemStockStatus(stock.status),
    warehouseCode: stock.warehouseCode,
    warehouseName: stock.warehouseName,
  }))
}

export function useItemStocksQuery(sku: string | null, warehouseCode?: string) {
  const normalizedWarehouseCode = normalizeWarehouseCode(warehouseCode)

  return useQuery({
    enabled: Boolean(sku),
    queryFn: async () => {
      if (!sku) {
        throw new Error('SKU is required.')
      }

      const response = await api.get<ItemStocksApiResponse>(
        `/inventory/items/${encodeURIComponent(sku)}/stocks`,
        {
          params: normalizedWarehouseCode ? { warehouseCode: normalizedWarehouseCode } : undefined,
          suppressGlobalErrorToast: true,
        },
      )

      return toItemStockRows(response.data)
    },
    queryKey: sku ? itemStocksQueryKey(sku, normalizedWarehouseCode) : ['items', 'stocks', 'empty'],
  })
}
