import type { Stock, StockFilter } from './types'

function safetyRatio(stock: Stock): number {
  if (stock.safetyStock <= 0) return Number.POSITIVE_INFINITY
  return stock.quantity / stock.safetyStock
}

export function filterStocks(stocks: Stock[], filter: StockFilter): Stock[] {
  const keyword = filter.keyword.trim().toLowerCase()

  const filtered = stocks.filter((stock) => {
    if (keyword) {
      const matches =
        stock.itemName.toLowerCase().includes(keyword) || stock.sku.toLowerCase().includes(keyword)
      if (!matches) return false
    }

    if (filter.warehouseCode !== 'ALL' && stock.warehouseCode !== filter.warehouseCode) return false
    if (filter.status !== 'ALL' && stock.status !== filter.status) return false

    return true
  })

  const sorted = [...filtered]
  switch (filter.sort) {
    case 'safetyRatio':
      sorted.sort((a, b) => safetyRatio(a) - safetyRatio(b))
      break
    case 'name':
      sorted.sort((a, b) => a.itemName.localeCompare(b.itemName, 'ko'))
      break
    case 'quantity':
      sorted.sort((a, b) => b.quantity - a.quantity)
      break
    case 'lastAdjustedAt':
      sorted.sort((a, b) => b.lastAdjustedAt.localeCompare(a.lastAdjustedAt))
      break
  }

  return sorted
}
