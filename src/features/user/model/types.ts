import type { UserRole } from '@/shared/config/session'

/**
 * User 서비스 swagger 미수신 — HANDOFF §8(역할·상태·직급) 기반 UI 모델.
 * swagger 수신 시 필드명을 응답 스키마와 정합시킨다.
 */
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED'
export type UserApiRole = UserRole | 'WAREHOUSE_STAFF' | 'WAREHOUSE_MANAGER'
export type UserRoleFilter = 'ALL' | UserApiRole
export type UserTenancyCodeFilter =
  | 'ALL'
  | 'ADMIN'
  | 'HQ'
  | 'WH-HQ-001'
  | 'WH-HQ-002'
  | 'WH-BR-001'
  | 'WH-BR-002'
  | 'WH-BR-003'
  | 'WH-BR-004'
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

export type ActivityType = 'LOGIN' | 'ADJUST' | 'VIEW'

/** 마이페이지 최근 활동 표시용 */
export interface UserActivity {
  delta: number | null
  description: string
  id: number
  occurredAt: string
  refCode: string | null
  type: ActivityType
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  ADJUST: '재고 조정',
  LOGIN: '로그인',
  VIEW: '조회',
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
  createdAt: string
  email: string
  employeeNo: string
  joinedAt: string
  lastChangedPassAt: string
  lastLoginAt: string
  name: string
  position: UserPosition
  role: UserRole
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

export type MyPageResponse = Omit<UserDetailResponse, 'createdAt'>

export interface UpdateUserRequest {
  display_name: string
  email: string
  position: string
  role: UserApiRole
  tenancy_code: string
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
