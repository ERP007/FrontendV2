export type PurchaseOrderStatus = 'DRAFT' | 'APPROVED' | 'RECEIVED' | 'CANCELED'

/** 화면 표시용 진행 상태(status + 입고 saga 조합 파생값). 조합 규칙은 백엔드 소유. */
export type PurchaseOrderProgress =
  | 'DRAFT'
  | 'APPROVED'
  | 'INBOUND_IN_PROGRESS'
  | 'RECEIVED'
  | 'INBOUND_FAILED'
  | 'CANCELED'

/** 진행 상태 폴링 결과 */
export type ProgressOutcome = 'PENDING' | 'SUCCESS' | 'FAILED'

export type SortField = 'createdAt' | 'totalAmount'
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
  vendorName: string | null // master 삭제 등 예외 시 null 가능 (DRAFT도 채워짐)
  createdAt: string
  lineCount: number
  totalAmount: number
  currency: string
  status: PurchaseOrderStatus
  progress: PurchaseOrderProgress
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
  // DRAFT 상태에서는 백엔드가 name·unit 을 null 로 내려줄 수 있다.
  name: string | null
  unit: string | null
  quantity: number
  unitPrice: number
}

export interface PurchaseOrderDetailResponse {
  code: string
  vendor: VendorRef
  warehouse: WarehouseRef
  approvedBy: PersonInfo | null
  createdAt: string
  status: PurchaseOrderStatus
  progress: PurchaseOrderProgress
  totalAmount: number
  currency: string
  memo: string | null
  lines: PurchaseOrderDetailLine[]
}

/** 진행 상태 조회(폴링) — GET /procurement-orders/{code}/progress */
export interface PurchaseOrderProgressResponse {
  code: string
  progress: PurchaseOrderProgress
  pending: boolean // true 면 폴링 계속
  outcome: ProgressOutcome
  failureReason: string | null // FAILED 일 때만 값
}

/** 이력 부가데이터. 입고면 receivedDate, 취소면 cancelReason. DRAFT/APPROVED 전이는 payload=null. */
export interface PurchaseOrderHistoryPayload {
  receivedDate: string | null
  cancelReason: string | null
}

export interface PurchaseOrderHistoryResponse {
  status: PurchaseOrderStatus
  changedBy: PersonInfo | null
  changedAt: string
  payload: PurchaseOrderHistoryPayload | null
}

export interface PurchaseOrderKpiResponse {
  totalCount: number // CANCELED 제외 전체
  draftCount: number
  approvedCount: number
}

export interface VendorResponse {
  code: string
  name: string
  active: boolean
}

export interface DraftPurchaseOrderRequest {
  vendorCode: string
  warehouseCode: string
  memo?: string
  lines?: PurchaseOrderLineRequest[] // DRAFT 는 0개 허용, 최대 100
}

export interface CreatePurchaseOrderRequest {
  vendorCode: string
  warehouseCode: string
  memo?: string
  lines: PurchaseOrderLineRequest[] // 1개 이상 필수, 최대 100
}

export interface ReceivePurchaseOrderRequest {
  receivedDate: string
}

export interface CancelPurchaseOrderRequest {
  reason: string
}

/** 상태 전환 API 공통 응답 (생성·수정·승인·입고·취소). progress/담당자/입고일 등 부가정보 없음. */
export interface PurchaseOrderStatusResponse {
  code: string
  vendorCode: string
  warehouseCode: string
  status: PurchaseOrderStatus
  totalAmount: number
  currency: string
}
