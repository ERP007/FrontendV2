import type { UserRole } from '@/shared/config/session'

export type UserTenancyType = 'ADMIN' | 'HQ' | 'BRANCH' | 'WAREHOUSE'

export interface UserTenancyOption {
  code: string
  label: string
  roles: UserRole[]
  type: UserTenancyType
}

export const USER_TENANCY_OPTIONS: UserTenancyOption[] = [
  { code: 'ADMIN', label: '관리자', roles: ['ADMIN'], type: 'ADMIN' },
  { code: 'HQ', label: '본사', roles: ['HQ_MANAGER', 'HQ_STAFF'], type: 'HQ' },
  { code: 'WH-HQ-001', label: '본사 중앙창고', roles: ['HQ_MANAGER', 'HQ_STAFF'], type: 'HQ' },
  { code: 'WH-HQ-002', label: '판교 물류센터', roles: ['HQ_MANAGER', 'HQ_STAFF'], type: 'HQ' },
  {
    code: 'WH-BR-001',
    label: '강남 1지점',
    roles: ['BRANCH_MANAGER', 'BRANCH_STAFF'],
    type: 'BRANCH',
  },
  {
    code: 'WH-BR-002',
    label: '분당 1지점',
    roles: ['BRANCH_MANAGER', 'BRANCH_STAFF'],
    type: 'BRANCH',
  },
  {
    code: 'WH-BR-003',
    label: '부산 1지점',
    roles: ['BRANCH_MANAGER', 'BRANCH_STAFF'],
    type: 'BRANCH',
  },
  {
    code: 'WH-BR-004',
    label: '대구 1지점',
    roles: ['BRANCH_MANAGER', 'BRANCH_STAFF'],
    type: 'BRANCH',
  },
]

export function getUserTenancyOption(code: string) {
  return USER_TENANCY_OPTIONS.find((option) => option.code === code)
}

export function getUserTenancyLabel(code: string) {
  return getUserTenancyOption(code)?.label ?? code
}

export function getUserTenancyRoles(code: string): UserRole[] {
  return getUserTenancyOption(code)?.roles ?? ['ADMIN', 'HQ_MANAGER', 'HQ_STAFF', 'BRANCH_MANAGER', 'BRANCH_STAFF']
}
