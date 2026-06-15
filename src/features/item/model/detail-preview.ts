import type { Item, ItemDetail } from './types'

export function toItemDetailPreview(item: Item): ItemDetail {
  return {
    active: item.active,
    categoryCode: item.majorCategory,
    categoryName: item.majorCategory,
    createdAt: item.createdAt,
    name: item.name,
    safetyStock: item.defaultSafetyStock,
    sku: item.code,
    subCategoryCode: item.middleCategory || item.majorCategory,
    subCategoryName: item.middleCategory || '-',
    unit: item.unit,
    unitPrice: 0,
    updatedAt: item.updatedAt,
  }
}
