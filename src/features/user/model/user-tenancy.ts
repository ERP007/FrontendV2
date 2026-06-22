import type { UserRole } from '@/shared/config/session'

export type UserTenancyType = 'ADMIN' | 'HQ' | 'BRANCH' | 'WAREHOUSE'

export interface UserTenancyOption {
  code: string
  label: string
  roles: UserRole[]
  type: UserTenancyType
}

export interface WarehouseOption {
  code: string
  name: string
}

const USER_TENANCY_ROLES: Record<UserTenancyType, UserRole[]> = {
  ADMIN: ['ADMIN'],
  BRANCH: ['BRANCH_MANAGER', 'BRANCH_STAFF'],
  HQ: ['HQ_MANAGER', 'HQ_STAFF'],
  WAREHOUSE: [],
}

export const ADMIN_TENANCY_OPTION: UserTenancyOption = {
  code: 'ADMIN',
  label: '관리자',
  roles: USER_TENANCY_ROLES.ADMIN,
  type: 'ADMIN',
}

export const USER_TENANCY_OPTIONS: UserTenancyOption[] = [
  ADMIN_TENANCY_OPTION,
]

export function getUserTenancyOption(code: string) {
  return USER_TENANCY_OPTIONS.find((option) => option.code === code)
}

export function getUserTenancyLabel(code: string) {
  return getUserTenancyOption(code)?.label ?? code
}

export function getUserTenancyRoles(code: string): UserRole[] {
  return getUserTenancyRolesByType(getUserTenancyTypeFromCode(code))
}

export function getUserTenancyRolesByType(type: UserTenancyType): UserRole[] {
  return USER_TENANCY_ROLES[type]
}

export function getUserTenancyTypeFromCode(code: string): UserTenancyType {
  const normalizedCode = code.trim().toUpperCase()

  if (normalizedCode === 'ADMIN') {
    return 'ADMIN'
  }

  if (normalizedCode === 'HQ' || normalizedCode.startsWith('HQ-') || normalizedCode.startsWith('WH-HQ-')) {
    return 'HQ'
  }

  if (normalizedCode.startsWith('BR-') || normalizedCode.startsWith('WH-BR-')) {
    return 'BRANCH'
  }

  return 'WAREHOUSE'
}

export function toUserTenancyOption(option: WarehouseOption): UserTenancyOption {
  const type = getUserTenancyTypeFromCode(option.code)

  return {
    code: option.code,
    label: option.name,
    roles: getUserTenancyRolesByType(type),
    type,
  }
}
