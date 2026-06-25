import type { UserRole } from '@/shared/config/session'

/**
 * User 서비스 swagger 미수신 — HANDOFF §8(역할·상태·직급) 기반 UI 모델.
 * swagger 수신 시 필드명을 응답 스키마와 정합시킨다.
 */
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED'
export type UserApiRole = UserRole | 'WAREHOUSE_STAFF' | 'WAREHOUSE_MANAGER'
export type UserRoleFilter = 'ALL' | UserApiRole
export type UserTenancyCodeFilter = 'ALL' | string
export type UserStatusFilter = 'ALL' | UserStatus
export type UserSortBy = 'employeeNo' | 'name' | 'joinedAt'
export type UserSortDirection = 'ASC' | 'DESC'
export type CreateUserPasswordIssueMode = 'AUTO' | 'MANUAL'
export type CreateUserTenancy = 'ADMIN' | 'HQ' | 'BRANCH' | 'WAREHOUSE'

export interface User {
  email: string
  empNo: string
  id: number
  joinedAt: string
  name: string
  rank: string | null
  role: UserApiRole
  status: UserStatus
  warehouseName: string
}

export type UserActionType =
  | 'LOGIN'
  | 'VIEW'
  | 'WAREHOUSE_CREATED'
  | 'WAREHOUSE_UPDATED'
  | 'WAREHOUSE_STATUS_CHANGED'
  | 'STOCK_CREATED'
  | 'STOCK_ADJUSTED'
  | 'SAFETY_STOCK_UPDATED'
  | 'ITEM_CREATED'
  | 'ITEM_UPDATED'
  | 'ITEM_STATUS_CHANGED'
  | 'STOCK_INBOUND'
  | 'STOCK_OUTBOUND'
  | 'PROCUREMENT_ORDER_CREATED'
  | 'PROCUREMENT_ORDER_UPDATED'
  | 'PROCUREMENT_ORDER_STATUS_CHANGED'
  | 'SALES_ORDER_CREATED'
  | 'SALES_ORDER_UPDATED'
  | 'SALES_ORDER_STATUS_CHANGED'
  | (string & {})

/** 마이페이지 최근 활동 표시용 */
export interface UserActivity {
  actionType: UserActionType
  content: string | null
  employeeNo: string
  id: number
  occurredAt: string
  status: string | null
  title: string
}

export const USER_ACTION_TYPE_LABELS: Record<string, string> = {
  ITEM_CREATED: '부품 등록',
  ITEM_STATUS_CHANGED: '부품 상태 변경',
  ITEM_UPDATED: '부품 수정',
  LOGIN: '로그인',
  PROCUREMENT_ORDER_CREATED: '구매 주문',
  PROCUREMENT_ORDER_STATUS_CHANGED: '구매 상태 변경',
  PROCUREMENT_ORDER_UPDATED: '구매 수정',
  SAFETY_STOCK_UPDATED: '안전재고 조정',
  SALES_ORDER_CREATED: '발주 요청',
  SALES_ORDER_STATUS_CHANGED: '발주 상태 변경',
  SALES_ORDER_UPDATED: '발주 수정',
  STOCK_ADJUSTED: '재고 조정',
  STOCK_CREATED: '재고 추가',
  STOCK_INBOUND: '입고',
  STOCK_OUTBOUND: '출고',
  VIEW: '조회',
  WAREHOUSE_CREATED: '창고 추가',
  WAREHOUSE_STATUS_CHANGED: '창고 상태 변경',
  WAREHOUSE_UPDATED: '창고 수정',
}

export function getUserActionTypeLabel(actionType: UserActionType) {
  return USER_ACTION_TYPE_LABELS[actionType] ?? actionType
}

export const RANK_OPTIONS = ['사원', '주임', '대리', '과장', '차장', '부장'] as const

export interface UserFilter {
  keyword: string
  role: UserRoleFilter
  status: UserStatusFilter
  tenancyCode: UserTenancyCodeFilter
}

export const DEFAULT_USER_FILTER: UserFilter = {
  keyword: '',
  role: 'ALL',
  status: 'ALL',
  tenancyCode: 'ALL',
}

export type UserPosition = 'MANAGER' | 'STAFF'

/** GET /api/users/me 응답 */
export interface Me {
  email: string
  employeeNo: string
  joinedAt: string
  lastChangedPassAt: string | null
  lastLoginAt: string | null
  name: string
  position: string | null
  role: UserApiRole
  status: UserStatus
  tenancyCode: string
  tenancyName: string
  userId: string
}

export type PasswordIssueMode = 'AUTO' | 'MANUAL'

export interface UserFormValues {
  email: string
  empNo: string
  initialPassword: string
  name: string
  passwordMode: PasswordIssueMode
  rank: string
  role: UserRole
  tenancyCode: string
}

export interface FetchUsersParams {
  keyword?: string
  page: number
  role: UserRoleFilter
  size: number
  sortBy: UserSortBy
  sortDirection: UserSortDirection
  status: UserStatusFilter
  tenancyCode: UserTenancyCodeFilter
}

export interface UserListItem {
  department: string
  email: string
  employeeNo: string
  joinedAt: string
  name: string
  role: UserApiRole
  status: UserStatus
  userId: string
}

export interface UserListResponse {
  content: UserListItem[]
  hasNext: boolean
  hasPrevious: boolean
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CreateUserRequest {
  display_name: string
  email: string
  employee_no: string
  initial_password: string
  password_issue_mode: CreateUserPasswordIssueMode
  position: string
  role: UserApiRole
  tenancy: CreateUserTenancy
  tenancy_code: string
}

export interface CreateUserResponse {
  temporaryPassword: string | null
  user: unknown
}

export interface UserDetailResponse {
  createdAt: string | null
  email: string
  employeeNo: string
  joinedAt: string
  lastChangedPassAt: string | null
  lastLoginAt: string | null
  name: string
  position: string | null
  role: UserApiRole
  status: UserStatus
  tenancyCode: string
  tenancyName: string
  userId: string
}

export type MyPageResponse = Me

export interface UserDetailFormValues {
  email: string
  name: string
  position: string
  role: UserApiRole
  tenancyCode: string
}

export interface UpdateUserRequest {
  display_name: string
  email: string
  position: string
  role: UserApiRole
  tenancy_code: string
  tenancy_name: string
}

export interface SuspendToggleResponse {
  email: string
  employeeNo: string
  name: string
  status: UserStatus
  userId: string
}

export interface UserSuspensionRequest {
  suspended: boolean
}
