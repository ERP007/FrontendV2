import type { Item, ItemDetail } from './types'

const ITEM_DETAIL_META_BY_SKU: Record<string, { categoryCode: string; subCategoryCode: string; unitPrice: number }> = {
  'HMC-AC-03340': { categoryCode: 'AC', subCategoryCode: 'AC_COMPRESSOR', unitPrice: 82000 },
  'HMC-BR-01102': { categoryCode: 'BRAKE', subCategoryCode: 'BRAKE_PAD', unitPrice: 68000 },
  'HMC-CL-01769': { categoryCode: 'DRIVETRAIN', subCategoryCode: 'DRIVETRAIN_CLUTCH', unitPrice: 92000 },
  'HMC-DR-02055': { categoryCode: 'EXTERIOR', subCategoryCode: 'EXTERIOR_MIRROR', unitPrice: 145000 },
  'HMC-EL-04481': { categoryCode: 'ELECTRIC', subCategoryCode: 'ELECTRIC_POWER', unitPrice: 185000 },
  'HMC-EN-00214': { categoryCode: 'ENGINE', subCategoryCode: 'ENGINE_LUBRICATION', unitPrice: 15000 },
  'HMC-IN-02216': { categoryCode: 'ENGINE', subCategoryCode: 'ENGINE_INTAKE', unitPrice: 12000 },
  'HMC-LT-00088': { categoryCode: 'ELECTRIC', subCategoryCode: 'ELECTRIC_LIGHTING', unitPrice: 260000 },
  'HMC-SP-00673': { categoryCode: 'ENGINE', subCategoryCode: 'ENGINE_IGNITION', unitPrice: 22000 },
  'HMC-SU-00937': { categoryCode: 'SUSPENSION', subCategoryCode: 'SUSPENSION_DAMPER', unitPrice: 118000 },
  'HMC-TR-00501': { categoryCode: 'TRANSMISSION', subCategoryCode: 'TRANSMISSION_FLUID', unitPrice: 18000 },
  'HMC-WP-00229': { categoryCode: 'ENGINE', subCategoryCode: 'ENGINE_COOLING', unitPrice: 76000 },
}

export function toItemDetailPreview(item: Item): ItemDetail {
  const meta = ITEM_DETAIL_META_BY_SKU[item.code]

  return {
    active: item.active,
    categoryCode: meta?.categoryCode ?? item.majorCategory,
    categoryName: item.majorCategory,
    createdAt: item.createdAt,
    name: item.name,
    safetyStock: item.defaultSafetyStock,
    sku: item.code,
    subCategoryCode: meta?.subCategoryCode ?? (item.middleCategory || item.majorCategory),
    subCategoryName: item.middleCategory || '-',
    unit: item.unit,
    unitPrice: meta?.unitPrice ?? 0,
    updatedAt: item.updatedAt,
  }
}
