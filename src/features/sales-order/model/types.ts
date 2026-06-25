// =============================================================================
// Sales 서비스 백엔드 DTO (요청/응답 스키마)
//
// 백엔드 API 스펙과 1:1 정합되는 순수 데이터 타입만 둔다.
// 화면 표현용 모델·라벨·헬퍼는 ./ui-types 에 분리한다.
// 날짜는 문자열로 다룬다: ISODate "YYYY-MM-DD", Instant ISO-8601 UTC.
// 페이지 envelope 는 공용 PageResponse 를 재사용한다.
//
// 성공 응답은 공통 래퍼가 없고 DTO 를 직접 반환한다.
// 사용자코드·이름·직책·역할·창고코드는 서버가 JWT claim 에서 추출하므로
// 요청 바디에 넣지 않는다.
// =============================================================================

import type { PageResponse } from '@/shared/api'

// ----- Enums -----
export type CarrierType = 'VEHICLE' | 'DELIVERY_SERVICE' | 'OTHER' // 차량/택배/기타
export type Priority = 'URGENT' | 'NORMAL'
export type RejectReasonCategory = 'OUT_OF_STOCK' | 'POLICY' | 'DUPLICATE' | 'OTHER'

/** 발주 비즈니스 상태 */
export type SalesOrderStatus =
  | 'DRAFT'
  | 'REQUESTED'
  | 'APPROVED'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELED'

/** 화면 표시용 진행 상태(status + saga 조합 파생값). 조합 규칙은 백엔드 소유. */
export type OrderProgress =
  | 'DRAFT'
  | 'REQUESTED'
  | 'OUTBOUND_IN_PROGRESS' // 승인 후 출고 진행중
  | 'APPROVED' // 출고확정
  | 'OUTBOUND_FAILED' // 출고 보상 → 재승인 필요
  | 'INBOUND_IN_PROGRESS' // 입고 진행중
  | 'DELIVERED' // 입고확정
  | 'INBOUND_FAILED' // 입고 보상 → 재입고 필요
  | 'REJECTED'
  | 'CANCELED'

/** 진행 상태 폴링 결과 */
export type ProgressOutcome = 'PENDING' | 'SUCCESS' | 'FAILED'

/** 현재 백엔드가 지원하는 정렬 필드는 requestedAt 뿐이다. */
export type SalesOrderSortField = 'requestedAt'
export type SortDirection = 'asc' | 'desc'
export type PageSize = 10 | 20 | 50

// ----- 공통 서브 객체 -----
export interface WarehouseInfo {
  code: string
  name: string | null // 확정 후 스냅샷, DRAFT 면 live
}

/** 객체 전체가 null 가능 */
export interface PersonInfo {
  code: string
  name: string
  position: string
}

/** 요청 정보(요청자 + 요청 시각). DRAFT 면 null. */
export interface RequestInfo {
  requestedBy: PersonInfo
  requestedAt: string // ISO Instant
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

// ----- 공통 상태전환 응답 (모든 상태전환 API 공통) -----
export interface SalesOrderStatusChangedResponse {
  code: string
  fromWarehouseCode: string // 출고 창고
  toWarehouseCode: string // 수신(지점) 창고
  status: SalesOrderStatus
  progress: OrderProgress
  totalQuantity: number // 라인 수량 합
}

// ----- 1~5. 생성 / 임시저장 / 제출 요청 -----
export interface CreateSalesOrderRequest {
  warehouseCode: string // 필수, 입고 창고
  memo?: string // <= 500
  lines: SalesOrderLineRequest[] // 1..50 필수
}

export interface CreateDraftSalesOrderRequest {
  warehouseCode: string
  memo?: string // <= 500
  lines?: SalesOrderLineRequest[] // 0..50 (선택)
}

/** 임시저장 수정(#3). 구조는 임시저장 생성(#2)과 동일. */
export type UpdateDraftSalesOrderRequest = CreateDraftSalesOrderRequest

export interface SubmitSalesOrderRequest {
  warehouseCode: string
  memo?: string // <= 500
  lines: SalesOrderLineRequest[] // 1..50
}

// ----- 6. approve -----
export interface ApproveSalesOrderRequest {
  approvedDate: string // ISODate, 필수, 오늘/과거
  carrierType: CarrierType // 필수
  invoiceNumber?: string
}

// ----- 7. reject -----
export interface RejectSalesOrderRequest {
  reasonCategory: RejectReasonCategory // 필수
  memo?: string // <= 500, OTHER 면 필수
}

// ----- 8. cancel -----
export interface CancelSalesOrderRequest {
  reason: string // 필수(NotBlank)
}

// ----- 9. deliver -----
export interface DeliverSalesOrderRequest {
  deliveredDate: string // ISODate, 필수, 오늘/과거
}

// ----- 10. 진행 상태 조회 (폴링) -----
export interface SalesOrderProgressResponse {
  code: string
  progress: OrderProgress
  pending: boolean // true 면 폴링 계속, false 면 중단
  outcome: ProgressOutcome
  failureReason: string | null // FAILED 일 때만 채워짐
}

// ----- 11. 지점 목록 -----
// query 는 전부 optional, status 는 CSV 문자열로 전송한다.
export interface BranchSalesOrderQuery {
  search?: string
  status?: string // CSV. 기본 "DRAFT,REQUESTED,APPROVED,DELIVERED"
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
  progress: OrderProgress
  request: RequestInfo | null // DRAFT 면 null
  itemCount: number
}

export type BranchSalesOrderPageResponse = PageResponse<BranchSalesOrderSummary>

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
  fromWarehouse: WarehouseInfo
  request: RequestInfo | null // DRAFT 면 null
  itemCount: number
  status: SalesOrderStatus
  progress: OrderProgress
}

export type HqSalesOrderPageResponse = PageResponse<HqSalesOrderSummary>

// ----- 13. 발주 상세 (지점/본사 공통) -----
export interface SalesOrderDetailResponse {
  code: string
  status: SalesOrderStatus
  progress: OrderProgress
  fromWarehouse: WarehouseInfo
  toWarehouse: WarehouseInfo
  requester: PersonInfo | null
  requestedAt: string | null // ISO Instant, DRAFT 면 null
  requestMemo: string | null
  approval: PersonInfo | null // 미승인이면 null
  lines: SalesOrderLineResponse[]
}

// ----- 14. 지점 KPI -----
export interface BranchSalesOrderKpiResponse {
  totalCount: number
  draftCount: number
  requestedCount: number
  approvedCount: number
}

// ----- 15. 본사 KPI -----
export interface HqSalesOrderKpiResponse {
  totalCount: number
  requestedCount: number
  approvedCount: number
}

// ----- 16. 이력 (배열, 최신순, 역할 자동분기) -----
/** 상태별 다형 meta(discriminator `type`). DRAFT/REQUESTED 는 meta = null. */
export type StatusChangeMeta =
  | {
      type: 'APPROVED'
      approvedDate: string // YYYY-MM-DD
      carrierType: string | null
      invoiceNumber: string | null
    }
  | { type: 'REJECTED'; reasonCategory: string | null; reasonMemo: string | null }
  | { type: 'DELIVERED'; deliveredDate: string } // YYYY-MM-DD
  | { type: 'CANCELED'; reason: string }

export interface SalesOrderHistoryResponse {
  status: SalesOrderStatus
  changedBy: PersonInfo | null
  changedAt: string // ISO Instant
  meta: StatusChangeMeta | null
}

export type SalesOrderHistoryListResponse = SalesOrderHistoryResponse[]
