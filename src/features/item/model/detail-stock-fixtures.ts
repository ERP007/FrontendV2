import type { ItemStockRow } from './types'

export interface ItemStockFixtureRow extends ItemStockRow {
  sku: string
}

const DEFAULT_BRANCH_WAREHOUSE_CODE = 'WH-SE-001'
const DEFAULT_FALLBACK_SAFETY_STOCK = 50

const BRANCH_TENANCY_WAREHOUSE_CODES: Record<string, string> = {
  'WH-BR-001': 'WH-SE-001',
  'WH-BR-002': 'WH-SE-002',
  'WH-BR-003': 'WH-BS-001',
  'WH-BR-004': 'WH-DG-001',
}

const FALLBACK_STOCK_WAREHOUSES = [
  { ratio: 3.2, warehouseCode: 'WH-HQ-001', warehouseName: '본사 중앙창고' },
  { ratio: 0.7, warehouseCode: 'WH-SE-001', warehouseName: '서울 1창고' },
  { ratio: 1.15, warehouseCode: 'WH-SE-002', warehouseName: '서울 2창고' },
  { ratio: 0.45, warehouseCode: 'WH-BS-001', warehouseName: '부산 1창고' },
  { ratio: 0, warehouseCode: 'WH-IC-001', warehouseName: '인천 1창고' },
] as const

export const ITEM_STOCK_FIXTURES: ItemStockFixtureRow[] = [
  {
    currentStock: 320,
    safetyStock: 120,
    sku: 'HMC-EN-00214',
    status: 'NORMAL',
    warehouseCode: 'WH-HQ-001',
    warehouseName: '본사 중앙창고',
  },
  {
    currentStock: 8,
    safetyStock: 120,
    sku: 'HMC-EN-00214',
    status: 'LOW',
    warehouseCode: 'WH-SE-001',
    warehouseName: '서울 1창고',
  },
  {
    currentStock: 42,
    safetyStock: 120,
    sku: 'HMC-EN-00214',
    status: 'LOW',
    warehouseCode: 'WH-SE-002',
    warehouseName: '서울 2창고',
  },
  {
    currentStock: 156,
    safetyStock: 120,
    sku: 'HMC-EN-00214',
    status: 'NORMAL',
    warehouseCode: 'WH-DJ-001',
    warehouseName: '대전지점 창고',
  },
  {
    currentStock: 420,
    safetyStock: 300,
    sku: 'HMC-BR-01102',
    status: 'NORMAL',
    warehouseCode: 'WH-HQ-001',
    warehouseName: '본사 중앙창고',
  },
  {
    currentStock: 112,
    safetyStock: 300,
    sku: 'HMC-BR-01102',
    status: 'LOW',
    warehouseCode: 'WH-SE-001',
    warehouseName: '서울 1창고',
  },
  {
    currentStock: 0,
    safetyStock: 40,
    sku: 'HMC-EL-04481',
    status: 'OUT',
    warehouseCode: 'WH-SE-001',
    warehouseName: '서울 1창고',
  },
  {
    currentStock: 96,
    safetyStock: 40,
    sku: 'HMC-EL-04481',
    status: 'NORMAL',
    warehouseCode: 'WH-HQ-001',
    warehouseName: '본사 중앙창고',
  },
  {
    currentStock: 66,
    safetyStock: 60,
    sku: 'HMC-SU-00937',
    status: 'NORMAL',
    warehouseCode: 'WH-SE-001',
    warehouseName: '서울 1창고',
  },
  {
    currentStock: 14,
    safetyStock: 50,
    sku: 'HMC-IN-02216',
    status: 'LOW',
    warehouseCode: 'WH-SE-001',
    warehouseName: '서울 1창고',
  },
  {
    currentStock: 212,
    safetyStock: 80,
    sku: 'HMC-LT-00088',
    status: 'NORMAL',
    warehouseCode: 'WH-HQ-001',
    warehouseName: '본사 중앙창고',
  },
  {
    currentStock: 144,
    safetyStock: 90,
    sku: 'HMC-AC-03340',
    warehouseCode: 'WH-HQ-001',
    warehouseName: '본사 중앙창고',
  },
  {
    currentStock: 0,
    safetyStock: 25,
    sku: 'HMC-TR-00501',
    warehouseCode: 'WH-SE-001',
    warehouseName: '서울 1창고',
  },
  {
    currentStock: 960,
    safetyStock: 600,
    sku: 'HMC-SP-00673',
    status: 'NORMAL',
    warehouseCode: 'WH-DJ-001',
    warehouseName: '대전지점 창고',
  },
  {
    currentStock: 22,
    safetyStock: 45,
    sku: 'HMC-WP-00229',
    status: 'LOW',
    warehouseCode: 'WH-SE-001',
    warehouseName: '서울 1창고',
  },
  {
    currentStock: 81,
    safetyStock: 30,
    sku: 'HMC-CL-01769',
    status: 'NORMAL',
    warehouseCode: 'WH-HQ-001',
    warehouseName: '본사 중앙창고',
  },
  {
    currentStock: 157,
    safetyStock: 70,
    sku: 'HMC-DR-02055',
    status: 'NORMAL',
    warehouseCode: 'WH-SE-001',
    warehouseName: '서울 1창고',
  },
]

function hashSku(sku: string) {
  return Array.from(sku).reduce((hash, character) => hash + character.charCodeAt(0), 0)
}

function resolveMockStockStatus(
  currentStock: number,
  safetyStock: number,
): ItemStockFixtureRow['status'] {
  if (currentStock === 0) {
    return 'OUT'
  }

  return currentStock < safetyStock ? 'LOW' : 'NORMAL'
}

function buildFallbackItemStockRows(sku: string, safetyStock = DEFAULT_FALLBACK_SAFETY_STOCK) {
  const normalizedSafetyStock = Math.max(1, Math.round(safetyStock))
  const seed = hashSku(sku)

  return FALLBACK_STOCK_WAREHOUSES.map((warehouse, index) => {
    const variation = warehouse.ratio === 0 ? 0 : (seed + index * 17) % 19
    const currentStock = Math.max(0, Math.round(normalizedSafetyStock * warehouse.ratio + variation))

    return {
      currentStock,
      safetyStock: normalizedSafetyStock,
      sku,
      status: resolveMockStockStatus(currentStock, normalizedSafetyStock),
      warehouseCode: warehouse.warehouseCode,
      warehouseName: warehouse.warehouseName,
    }
  })
}

export function getMockItemStockRows(sku: string, safetyStock?: number) {
  const rows = ITEM_STOCK_FIXTURES.filter((row) => row.sku === sku)

  if (rows.length > 0) {
    return rows
  }

  return buildFallbackItemStockRows(sku, safetyStock)
}

function getDefaultBranchWarehouseCode(rows: ItemStockFixtureRow[]) {
  return rows.find((row) => row.warehouseCode !== 'WH-HQ-001')?.warehouseCode ?? DEFAULT_BRANCH_WAREHOUSE_CODE
}

export function getMockBranchWarehouseCode(sku: string, tenancyCode?: string | null, safetyStock?: number) {
  const skuRows = getMockItemStockRows(sku, safetyStock)

  if (tenancyCode && skuRows.some((row) => row.warehouseCode === tenancyCode)) {
    return tenancyCode
  }

  if (tenancyCode) {
    const mappedWarehouseCode = BRANCH_TENANCY_WAREHOUSE_CODES[tenancyCode]

    if (mappedWarehouseCode && skuRows.some((row) => row.warehouseCode === mappedWarehouseCode)) {
      return mappedWarehouseCode
    }
  }

  return getDefaultBranchWarehouseCode(skuRows)
}

export function getMockVisibleItemStockRows({
  canManage,
  safetyStock,
  sku,
  tenancyCode,
  warehouseCode,
}: {
  canManage: boolean
  safetyStock?: number
  sku: string
  tenancyCode?: string | null
  warehouseCode?: string
}) {
  const rows = getMockItemStockRows(sku, safetyStock)

  if (canManage) {
    if (warehouseCode && warehouseCode !== 'ALL') {
      return rows.filter((row) => row.warehouseCode === warehouseCode)
    }

    return rows
  }

  const branchWarehouseCode = getMockBranchWarehouseCode(sku, tenancyCode, safetyStock)

  return rows.filter((row) => row.warehouseCode === branchWarehouseCode)
}
