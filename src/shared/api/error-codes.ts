export const USER_ERROR_CODES = [
  'USR-001',
  'USR-002',
  'USR-005',
  'USR-006',
  'USR-007',
  'USR-008',
  'USR-009',
  'USR-010',
  'USR-011',
  'USR-012',
  'USR-013',
  'USR-014',
  'USR-015',
  'USR-016',
  'USR-017',
  'USR-018',
  'USR-019',
  'USR-022',
] as const

export const ITEM_ERROR_CODES = [
  'ITM-001',
  'ITM-002',
  'ITM-003',
  'ITM-004',
  'ITM-005',
  'ITM-006',
  'ITM-007',
  'ITM-008',
  'ITM-009',
  'ITM-010',
  'ITM-011',
  'ITM-012',
  'ITM-013',
  'ITM-014',
  'ITM-015',
  'ITM-016',
  'ITM-017',
  'ITM-018',
  'ITM-019',
  'ITM-020',
  'ITM-021',
] as const

export const INVENTORY_ERROR_CODES = [
  'INV-001',
  'INV-002',
  'INV-003',
  'INV-004',
  'INV-005',
  'INV-006',
  'INV-007',
  'INV-008',
  'INV-009',
  'INV-010',
  'INV-011',
  'INV-012',
  'INV-013',
  'INV-014',
  'INV-015',
] as const

export const PURCHASE_ORDER_ERROR_CODES = [
  'PO-001',
  'PO-002',
  'PO-003',
  'PO-004',
  'PO-005',
  'PO-006',
  'PO-007',
  'PO-008',
  'PO-009',
  'PO-010',
  'PO-011',
  'PO-012',
  'PO-013',
  'PO-014',
  'PO-015',
  'PO-016',
  'PO-017',
  'PO-018',
] as const

export const SALES_ORDER_ERROR_CODES = [
  'SO-001',
  'SO-002',
  'SO-003',
  'SO-004',
  'SO-005',
  'SO-006',
  'SO-007',
  'SO-008',
  'SO-009',
  'SO-010',
  'SO-011',
  'SO-012',
  'SO-013',
  'SO-014',
  'SO-015',
  'SO-016',
  'SO-017',
  'SO-018',
  'SO-019',
  'SO-020',
  'SO-021',
  'SO-022',
  'SO-023',
  'SO-024',
  'SO-025',
  'SO-026',
  'SO-027',
  'SO-028',
  'SO-029',
  'SO-030',
  'SO-031',
] as const

export const GLOBAL_ERROR_CODES = ['ER-403', 'ER-500', 'ER-502'] as const

export const COMMON_ERROR_CODES = [
  ...GLOBAL_ERROR_CODES,
  'UNKNOWN_ERROR',
  'NETWORK_ERROR',
] as const

export type GlobalErrorCode = (typeof GLOBAL_ERROR_CODES)[number]

export type UserErrorCode = (typeof USER_ERROR_CODES)[number]
export type ItemErrorCode = (typeof ITEM_ERROR_CODES)[number]
export type InventoryErrorCode = (typeof INVENTORY_ERROR_CODES)[number]
export type PurchaseOrderErrorCode = (typeof PURCHASE_ORDER_ERROR_CODES)[number]
export type SalesOrderErrorCode = (typeof SALES_ORDER_ERROR_CODES)[number]
export type CommonErrorCode = (typeof COMMON_ERROR_CODES)[number]

export type DomainErrorCode =
  | UserErrorCode
  | ItemErrorCode
  | InventoryErrorCode
  | PurchaseOrderErrorCode
  | SalesOrderErrorCode

export type ErrorCode = DomainErrorCode | CommonErrorCode

export type ErrorDomain = 'USR' | 'ITM' | 'INV' | 'PO' | 'SO' | 'COMMON'

export function getErrorDomain(code: string): ErrorDomain {
  if (code.startsWith('USR-')) return 'USR'
  if (code.startsWith('ITM-')) return 'ITM'
  if (code.startsWith('INV-')) return 'INV'
  if (code.startsWith('PO-')) return 'PO'
  if (code.startsWith('SO-')) return 'SO'
  return 'COMMON'
}

const ALL_DOMAIN_ERROR_CODES: ReadonlySet<string> = new Set([
  ...USER_ERROR_CODES,
  ...ITEM_ERROR_CODES,
  ...INVENTORY_ERROR_CODES,
  ...PURCHASE_ORDER_ERROR_CODES,
  ...SALES_ORDER_ERROR_CODES,
])

export function isDomainErrorCode(code: string): code is DomainErrorCode {
  return ALL_DOMAIN_ERROR_CODES.has(code)
}
