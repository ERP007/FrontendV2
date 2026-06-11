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

/** swagger BranchLocationResponse */
export interface BranchLocation {
  id: number
  name: string
}

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
