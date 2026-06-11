import type { UserRole } from '@/shared/config/session'

/**
 * User 서비스 swagger 미수신 — HANDOFF §8(역할·상태·직급) 기반 UI 모델.
 * swagger 수신 시 필드명을 응답 스키마와 정합시킨다.
 */
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED'

export interface User {
  email: string
  empNo: string
  id: number
  joinedAt: string
  name: string
  rank: string | null
  role: UserRole
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
  role: 'ALL' | UserRole
  status: 'ALL' | UserStatus
  warehouseName: 'ALL' | string
}

export const DEFAULT_USER_FILTER: UserFilter = {
  keyword: '',
  role: 'ALL',
  status: 'ALL',
  warehouseName: 'ALL',
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
  warehouseName: string
}
