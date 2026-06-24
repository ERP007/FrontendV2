import fs from 'node:fs'
import path from 'node:path'

export type E2ERole =
  | 'admin'
  | 'hq'
  | 'branch'
  | 'hqManager'
  | 'hqStaff'
  | 'branchManager'
  | 'branchStaff'

export interface RoleConfig {
  defaultPath: string
  expectedRoles: string[]
  passwordEnv: string
  role: E2ERole
  stateFile: string
  usernameEnv: string
}

export const BASE_URL = process.env.E2E_BASE_URL ?? 'https://erp007.xyz'
export const AUTH_STATE_DIR = path.join(process.cwd(), 'playwright', '.auth')

export const ROLE_CONFIGS: RoleConfig[] = [
  {
    defaultPath: '/users',
    expectedRoles: ['ADMIN'],
    passwordEnv: 'E2E_ADMIN_PASSWORD',
    role: 'admin',
    stateFile: 'admin.json',
    usernameEnv: 'E2E_ADMIN_USERNAME',
  },
  {
    defaultPath: '/dashboard',
    expectedRoles: ['ADMIN', 'HQ_MANAGER', 'HQ_STAFF'],
    passwordEnv: 'E2E_HQ_PASSWORD',
    role: 'hq',
    stateFile: 'hq.json',
    usernameEnv: 'E2E_HQ_USERNAME',
  },
  {
    defaultPath: '/branch/sales-orders',
    expectedRoles: ['BRANCH_MANAGER', 'BRANCH_STAFF'],
    passwordEnv: 'E2E_BRANCH_PASSWORD',
    role: 'branch',
    stateFile: 'branch.json',
    usernameEnv: 'E2E_BRANCH_USERNAME',
  },
  {
    defaultPath: '/dashboard',
    expectedRoles: ['HQ_MANAGER'],
    passwordEnv: 'E2E_HQ_MANAGER_PASSWORD',
    role: 'hqManager',
    stateFile: 'hq-manager.json',
    usernameEnv: 'E2E_HQ_MANAGER_USERNAME',
  },
  {
    defaultPath: '/dashboard',
    expectedRoles: ['HQ_STAFF'],
    passwordEnv: 'E2E_HQ_STAFF_PASSWORD',
    role: 'hqStaff',
    stateFile: 'hq-staff.json',
    usernameEnv: 'E2E_HQ_STAFF_USERNAME',
  },
  {
    defaultPath: '/branch/sales-orders',
    expectedRoles: ['BRANCH_MANAGER'],
    passwordEnv: 'E2E_BRANCH_MANAGER_PASSWORD',
    role: 'branchManager',
    stateFile: 'branch-manager.json',
    usernameEnv: 'E2E_BRANCH_MANAGER_USERNAME',
  },
  {
    defaultPath: '/branch/sales-orders',
    expectedRoles: ['BRANCH_STAFF'],
    passwordEnv: 'E2E_BRANCH_STAFF_PASSWORD',
    role: 'branchStaff',
    stateFile: 'branch-staff.json',
    usernameEnv: 'E2E_BRANCH_STAFF_USERNAME',
  },
]

export function requiredRoleConfig(role: E2ERole) {
  const config = ROLE_CONFIGS.find((candidate) => candidate.role === role)

  if (!config) {
    throw new Error(`Unknown E2E role: ${role}`)
  }

  return config
}

export function authStatePath(role: E2ERole) {
  return path.join(AUTH_STATE_DIR, requiredRoleConfig(role).stateFile)
}

export function hasRoleCredentials(config: RoleConfig) {
  return Boolean(process.env[config.usernameEnv] && process.env[config.passwordEnv])
}

export function hasAuthState(role: E2ERole) {
  return fs.existsSync(authStatePath(role))
}

export function isMutationEnabled() {
  return process.env.E2E_ENABLE_MUTATION === 'true'
}

export function isTestTargetProfile() {
  return process.env.E2E_TARGET_PROFILE === 'test'
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

export function tomorrowIsoDate() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().slice(0, 10)
}
