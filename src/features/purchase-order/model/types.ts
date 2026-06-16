export type PurchaseOrderStatus = 'DRAFT' | 'APPROVED' | 'RECEIVED' | 'CANCELED'
export type SortField = 'createdAt' | 'desiredArrivalDate' | 'totalAmount'
export type SortDirection = 'asc' | 'desc'
export type PageSize = 10 | 20 | 50

export interface PersonInfo {
  code: string
  name: string
  position: string
}

export interface VendorRef {
  code: string
  name: string
}

export interface WarehouseRef {
  code: string
  name: string
}

export interface PurchaseOrderLineRequest {
  itemSku: string
  quantity: number
  unitPrice: number
}

export interface SearchPurchaseOrderRequest {
  search?: string
  status?: string
  vendorCode?: string
  startDate?: string
  endDate?: string
  sortField?: SortField
  sortDirection?: SortDirection
  size?: PageSize
  page?: number
}

export interface PurchaseOrderSummaryResponse {
  code: string
  vendorCode: string
  vendorName: string
  createdAt: string
  desiredArrivalDate: string
  lineCount: number
  totalQuantity: number | null
  unit: string | null
  totalAmount: number
  currency: string
  status: PurchaseOrderStatus
}

export interface PurchaseOrderPageResponse {
  content: PurchaseOrderSummaryResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

export interface PurchaseOrderDetailLine {
  id: number
  sku: string
  name: string
  unit: string
  quantity: number
  unitPrice: number
}

export interface PurchaseOrderDetailResponse {
  code: string
  vendor: VendorRef
  warehouse: WarehouseRef
  approvedBy: PersonInfo | null
  createdAt: string
  desiredArrivalDate: string
  status: PurchaseOrderStatus
  totalAmount: number
  currency: string
  lines: PurchaseOrderDetailLine[]
}

export interface PurchaseOrderHistoryResponse {
  status: PurchaseOrderStatus
  changedBy: PersonInfo | null
  changedAt: string
}

export interface PurchaseOrderKpiResponse {
  totalCount: number
  draftCount: number
  approvedCount: number
  delayedCount: number
}

export interface VendorResponse {
  code: string
  name: string
  active: boolean
}

export interface DraftPurchaseOrderRequest {
  vendorCode: string
  warehouseCode: string
  desiredArrivalDate: string
  memo?: string
  lines?: PurchaseOrderLineRequest[]
}

export interface CreatePurchaseOrderRequest {
  vendorCode: string
  warehouseCode: string
  desiredArrivalDate: string
  memo?: string
  lines: PurchaseOrderLineRequest[]
}

export interface CreatePurchaseOrderResponse {
  code: string
  vendorCode: string
  warehouseCode: string
  desiredArrivalDate: string
  status: PurchaseOrderStatus
  totalAmount: number
  currency: string
  createdAt: string
}

export interface ApprovePurchaseOrderResponse {
  code: string
  vendorCode: string
  warehouseCode: string
  desiredArrivalDate: string
  status: PurchaseOrderStatus
  totalAmount: number
  currency: string
  approvedAt: string
}

export interface ReceivePurchaseOrderRequest {
  receivedDate: string
}

export interface ReceivePurchaseOrderResponse {
  code: string
  vendorCode: string
  warehouseCode: string
  receivedDate: string
  status: PurchaseOrderStatus
  totalAmount: number
  currency: string
  receivedAt: string
}

export interface CancelPurchaseOrderRequest {
  reason: string
}

export interface CancelPurchaseOrderResponse {
  code: string
  status: PurchaseOrderStatus
  canceledBy: string
  canceledAt: string
  reason: string
}
