/**
 * Inventory Service swagger의 WarehouseDetailResponse를 기준으로 한 UI 모델.
 * (docs/api/inventory-openapi.json 참고 — 백엔드 연동 시 응답 타입과 1:1)
 */
export type WarehouseType = 'HQ' | 'DEALER'

export interface Warehouse {
  active: boolean
  address: string
  branchId: number | null
  branchName: string | null
  code: string
  createdAt: string
  id: number
  name: string
  type: WarehouseType
  updatedAt: string
  version: number
}

/**
 * 목록 조회 응답 항목(swagger WarehouseResponse).
 * 상세 응답(WarehouseDetailResponse)과 달리 branchId·version은 포함하지 않는다(address는 목록에도 포함).
 */
export type WarehouseListItem = Omit<Warehouse, 'branchId' | 'version'>

/** swagger BranchLocationResponse */
export interface BranchLocation {
  id: number
  name: string
}

/** GET /api/inventory/warehouses/hq 응답 단건 */
export type HqWarehouseSummary = Pick<Warehouse, 'code' | 'id' | 'name'>

export type WarehouseTypeFilter = 'ALL' | WarehouseType
export type WarehouseStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

export interface WarehouseFilter {
  keyword: string
  status: WarehouseStatusFilter
  type: WarehouseTypeFilter
}

export const DEFAULT_WAREHOUSE_FILTER: WarehouseFilter = {
  keyword: '',
  status: 'ALL',
  type: 'ALL',
}

/** swagger WarehouseCreateRequest/WarehouseUpdateRequest에 대응하는 폼 값 */
export interface WarehouseFormValues {
  address: string
  branchId: number | null
  code: string
  name: string
  type: WarehouseType
}

/** 헤더 클릭 정렬 대상. 백엔드 WarehouseSort 지원 컬럼(code/name/type/branch)으로 한정한다. */
export type WarehouseSortField = 'code' | 'name' | 'type' | 'branch'
export type WarehouseSortDirection = 'asc' | 'desc'

export interface WarehouseSort {
  direction: WarehouseSortDirection
  field: WarehouseSortField
}

/** 백엔드 기본 정렬(code,asc)과 일치시킨다. */
export const DEFAULT_WAREHOUSE_SORT: WarehouseSort = { direction: 'asc', field: 'code' }
