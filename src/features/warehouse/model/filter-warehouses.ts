import type { Warehouse, WarehouseFilter } from './types'

export function filterWarehouses(warehouses: Warehouse[], filter: WarehouseFilter): Warehouse[] {
  const keyword = filter.keyword.trim().toLowerCase()

  return warehouses.filter((warehouse) => {
    if (keyword) {
      const matches =
        warehouse.name.toLowerCase().includes(keyword) ||
        warehouse.code.toLowerCase().includes(keyword)
      if (!matches) return false
    }

    if (filter.type !== 'ALL' && warehouse.type !== filter.type) return false

    if (filter.status === 'ACTIVE' && !warehouse.active) return false
    if (filter.status === 'INACTIVE' && warehouse.active) return false

    return true
  })
}
