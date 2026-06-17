export type UserRole = 'ADMIN' | 'HQ_MANAGER' | 'HQ_STAFF' | 'BRANCH_MANAGER' | 'BRANCH_STAFF'

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: '시스템 관리자',
  HQ_MANAGER: '본사 매니저',
  HQ_STAFF: '본사 담당자',
  BRANCH_MANAGER: '지점 관리자',
  BRANCH_STAFF: '지점 담당자',
}

export function roleLabel(role?: string | null) {
  if (!role) {
    return '-'
  }

  return ROLE_LABELS[role as UserRole] ?? role
}

export function canAccessUserManagement(role?: string | null) {
  return role === 'ADMIN'
}

export function canAccessHqScope(role?: string | null) {
  return role === 'ADMIN' || role === 'HQ_MANAGER' || role === 'HQ_STAFF'
}

export function canAccessBranchScope(role?: string | null) {
  return role === 'BRANCH_MANAGER' || role === 'BRANCH_STAFF'
}

export interface SessionUser {
  branchName: string
  email: string
  empNo: string
  joinedAt: string
  lastLoginAt: string
  name: string
  rank: string
  role: UserRole
  warehouseName: string
}

/**
 * 백엔드 인증 연동 전까지 사용하는 데모 세션.
 * 연동 시 useMeQuery() 결과로 대체한다.
 */
export const MOCK_SESSION: SessionUser = {
  branchName: '서울 강남지점',
  email: 'jskim@hyundaiparts.com',
  empNo: 'HMC0001',
  joinedAt: '2023-04-12',
  lastLoginAt: '2026-06-11 08:52',
  name: '김정수',
  rank: '과장',
  role: 'BRANCH_MANAGER',
  warehouseName: '서울 1창고',
}
