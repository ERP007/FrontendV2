// =============================================================================
// Sales 서비스 백엔드 DTO (요청/응답 스키마)
//
// 백엔드 API 스펙과 1:1 정합되는 순수 데이터 타입만 둔다.
// 화면 표현용 모델·라벨·헬퍼는 ./ui-types 에 분리한다.
// 날짜는 문자열로 다룬다: ISODate "YYYY-MM-DD", Instant ISO-8601 UTC.
// 페이지 envelope 는 공용 PageResponse 를 재사용한다.
// =============================================================================

import type { PageResponse } from '@/shared/api'

// ----- Enums -----
export type CarrierType = 'VEHICLE' | 'DELIVERY_SERVICE' | 'OTHER' // 차량/택배/기타
export type Priority = 'URGENT' | 'NORMAL'
export type RejectReasonCategory = 'OUT_OF_STOCK' | 'POLICY' | 'DUPLICATE' | 'OTHER'
export type SalesOrderStatus =
  | 'DRAFT'
  | 'REQUESTED'
  | 'APPROVED'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELED'
export type SalesOrderSortField = 'requestedAt' | 'desiredArrivalDate'
export type SortDirection = 'asc' | 'desc'
export type PageSize = 10 | 20 | 50

// ----- 공통 서브 객체 -----
export interface WarehouseInfo {
  code: string
  name: string | null
}

/** 객체 전체가 null 가능 */
export interface PersonInfo {
  code: string
  name: string
  position: string
}

// ----- 라인 -----
export interface SalesOrderLineRequest {
  itemCode: string // 필수
  quantity: number // int, >= 1
  priority: Priority
}

export interface SalesOrderLineResponse {
  id: number // Long
  itemCode: string
  itemName: string | null // 스냅샷
  unit: string | null // 스냅샷
  requestQuantity: number
}

// ----- 1~3. 생성 / 임시저장 / 제출(PUT) -----
export interface CreateSalesOrderRequest {
  warehouseCode: string // 필수, 수신 창고
  desiredArrivalDate: string // ISODate, 필수
  memo: string | null // <= 500
  lines: SalesOrderLineRequest[] // 1..50 필수
}

export interface CreateDraftSalesOrderRequest {
  warehouseCode: string
  desiredArrivalDate: string // ISODate
  memo: string | null
  lines?: SalesOrderLineRequest[] | null // 0..50 (선택)
}

export interface SubmitSalesOrderRequest {
  warehouseCode: string
  desiredArrivalDate: string // ISODate
  memo: string | null // <= 500
  lines: SalesOrderLineRequest[] // 1..50
}

export interface CreateSalesOrderResponse {
  code: string
  fromWarehouseCode: string
  toWarehouseCode: string
  desiredArrivalDate: string // ISODate
  status: SalesOrderStatus
  totalQuantity: number
  createdAt: string // Instant
}

// ----- 4. request (body 없음) -----
export interface RequestSalesOrderResponse {
  code: string
  fromWarehouseCode: string
  toWarehouseCode: string
  desiredArrivalDate: string // ISODate
  status: SalesOrderStatus
  totalQuantity: number
  createdAt: string // Instant
  requestedAt: string // Instant
}

// ----- 5. approve -----
export interface ApproveSalesOrderRequest {
  approvedDate: string // ISODate, 필수, 오늘/과거
  carrierType: CarrierType // 필수
  invoiceNumber: string | null
}

export interface ApproveSalesOrderResponse {
  code: string
  fromWarehouseCode: string
  toWarehouseCode: string
  approvedDate: string // ISODate
  carrierType: CarrierType | null
  invoiceNumber: string | null
  status: SalesOrderStatus
  totalQuantity: number
  approvedAt: string // Instant
}

// ----- 6. reject -----
export interface RejectSalesOrderRequest {
  reasonCategory: RejectReasonCategory // 필수
  memo: string | null // <= 500, 공백이면 서버가 null
}

export interface RejectSalesOrderResponse {
  code: string
  status: SalesOrderStatus
  reasonCategory: RejectReasonCategory
  memo: string | null
  rejectedBy: string
  rejectedAt: string // Instant
}

// ----- 7. cancel -----
export interface CancelSalesOrderRequest {
  reason: string // 필수
}

export interface CancelSalesOrderResponse {
  code: string
  status: SalesOrderStatus
  canceledBy: string
  canceledAt: string // Instant
  reason: string
}

// ----- 8. deliver -----
export interface DeliverSalesOrderRequest {
  deliveredDate: string // ISODate, 필수, 오늘/과거
}

export interface DeliverSalesOrderResponse {
  code: string
  fromWarehouseCode: string
  toWarehouseCode: string
  deliveredDate: string // ISODate
  status: SalesOrderStatus
  totalQuantity: number
  deliveredAt: string // Instant
}

// ----- 9. 지점 목록 -----
// query 는 전부 optional, status 는 CSV 문자열로 전송한다.
export interface BranchSalesOrderQuery {
  search?: string
  status?: string // "REQUESTED,APPROVED" 형태. 기본 "DRAFT,REQUESTED,APPROVED,DELIVERED"
  startDate?: string // ISODate, 기본 now-90d
  endDate?: string // ISODate, 기본 now
  sortField?: SalesOrderSortField // 기본 requestedAt
  sortDirection?: SortDirection // 기본 desc
  page?: number // 기본 1, >= 1
  size?: PageSize // 기본 20
}

export interface BranchSalesOrderSummary {
  code: string
  status: SalesOrderStatus
  requestedAt: string | null // DRAFT 면 null
  desiredArrivalDate: string // ISODate
  itemCount: number
  totalQuantity: number
  unitSnapshot: string | null
}

export type BranchSalesOrderPageResponse = PageResponse<BranchSalesOrderSummary>

// ----- 10. 지점 상세 -----
export interface BranchSalesOrderDetailResponse {
  code: string
  status: SalesOrderStatus
  fromWarehouse: WarehouseInfo
  toWarehouse: WarehouseInfo
  desiredArrivalDate: string // ISODate
  memo: string | null // <= 500
  approvedAt: string | null // 승인 전 null
  invoiceNumber: string | null
  carrierType: CarrierType | null
  lines: SalesOrderLineResponse[]
}

// ----- 11. 지점 KPI -----
export interface BranchSalesOrderKpiResponse {
  totalCount: number
  draftCount: number
  requestedCount: number
  approvedCount: number
}

// ----- 12. 본사 목록 (BranchSalesOrderQuery + warehouseCode) -----
export interface HqSalesOrderQuery {
  warehouseCode?: string
  search?: string
  status?: string // CSV, 기본 "REQUESTED,APPROVED"
  startDate?: string // ISODate, 기본 now-90d
  endDate?: string // ISODate, 기본 now
  sortField?: SalesOrderSortField // 기본 requestedAt
  sortDirection?: SortDirection // 기본 desc
  page?: number // 기본 1
  size?: PageSize // 기본 20
}

export interface HqSalesOrderSummary {
  code: string
  fromWarehouseCode: string
  requestedBy: string | null
  requesterName: string | null
  requesterPosition: string | null
  requestedAt: string | null // Instant
  desiredArrivalDate: string // ISODate
  itemCount: number
  totalQuantity: number
  unitSnapshot: string | null
  status: SalesOrderStatus
}

export type HqSalesOrderPageResponse = PageResponse<HqSalesOrderSummary>

// ----- 13. 본사 상세 -----
export interface HqSalesOrderDetailResponse {
  code: string
  status: SalesOrderStatus
  fromWarehouse: WarehouseInfo
  toWarehouse: WarehouseInfo
  requester: PersonInfo | null
  requestedAt: string | null // Instant
  requestMemo: string | null
  desiredArrivalDate: string // ISODate
  approval: PersonInfo | null // 승인 전 null
  lines: SalesOrderLineResponse[]
}

// ----- 14. 본사 KPI -----
export interface HqSalesOrderKpiResponse {
  totalCount: number
  requestedCount: number
  approvedCount: number
  delayedCount: number
}

// ----- 15. 이력 (배열, 최신순, 역할 자동분기) -----
export interface SalesOrderHistoryResponse {
  status: SalesOrderStatus
  changedBy: PersonInfo | null
  changedAt: string // Instant
}

export type SalesOrderHistoryListResponse = SalesOrderHistoryResponse[]
