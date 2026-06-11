import dayjs from 'dayjs'

import { ITEM_CATEGORY_META } from './fixtures'

import type { Movement, Stock, StockKpi, StockSkuDetail } from './types'

/** 재고 목록·이력 fixture에서 KPI를 파생한다 (연동 시 GET /inventory/stocks/kpi 대체). */
export function deriveStockKpi(stocks: Stock[], movements: Movement[]): StockKpi {
  const weekAgo = dayjs().subtract(7, 'day')
  const adjustTypes = new Set(['INCREASE', 'DECREASE', 'ADJUST'])

  return {
    lowStockCount: stocks.filter((stock) => stock.status === 'LOW').length,
    noStockCount: stocks.filter((stock) => stock.status === 'OUT').length,
    recentAdjustCount: movements.filter(
      (movement) => adjustTypes.has(movement.type) && dayjs(movement.occurredAt).isAfter(weekAgo),
    ).length,
    totalSkuCount: stocks.length,
  }
}

/**
 * sku 단위 상세(창고별 재고 + 최근 이동 5건)를 파생한다
 * (연동 시 GET /inventory/stocks/{sku} 대체).
 */
export function buildStockSkuDetail(
  sku: string,
  stocks: Stock[],
  movements: Movement[],
): StockSkuDetail | null {
  const rows = stocks.filter((stock) => stock.sku === sku)
  const first = rows[0]
  if (!first) return null

  const category = ITEM_CATEGORY_META[sku] ?? { major: '-', middle: '-' }

  return {
    history: movements
      .filter((movement) => movement.sku === sku)
      .slice(0, 5)
      .map((movement) => ({
        delta: movement.delta,
        executorEmpNo: movement.executorEmpNo,
        executorName: movement.executorName,
        occurredAt: movement.occurredAt,
        type: movement.type,
      })),
    itemName: first.itemName,
    itemUnit: first.itemUnit,
    majorCategory: category.major,
    middleCategory: category.middle,
    sku,
    totalQuantity: rows.reduce((sum, row) => sum + row.quantity, 0),
    totalSafetyStock: rows.reduce((sum, row) => sum + row.safetyStock, 0),
    warehouse: rows.map((row) => ({
      quantity: row.quantity,
      safetyStock: row.safetyStock,
      status: row.status,
      warehouseCode: row.warehouseCode,
      warehouseId: row.warehouseId,
      warehouseName: row.warehouseName,
    })),
  }
}
