import { z } from 'zod'

const userApiRoles = [
  'ADMIN',
  'HQ_MANAGER',
  'HQ_STAFF',
  'BRANCH_MANAGER',
  'BRANCH_STAFF',
  'WAREHOUSE_STAFF',
  'WAREHOUSE_MANAGER',
] as const

type UserApiRoleValue = (typeof userApiRoles)[number]

export function normalizeUserApiRole(value: string): UserApiRoleValue | null {
  const roleMatch = value
    .trim()
    .match(
      /^(ADMIN|HQ_MANAGER|HQ_STAFF|BRANCH_MANAGER|BRANCH_STAFF|WAREHOUSE_STAFF|WAREHOUSE_MANAGER)(?:\s|·|ㆍ|・|$)/,
    )
  const roleCode = roleMatch?.[1] as UserApiRoleValue | undefined

  return roleCode && userApiRoles.some((role) => role === roleCode) ? roleCode : null
}

const userApiRoleSchema = z.string().transform((value, context) => {
  const roleCode = normalizeUserApiRole(value)

  if (roleCode) {
    return roleCode
  }

  context.addIssue({
    code: 'custom',
    message: `Invalid option: expected one of ${userApiRoles.map((role) => `"${role}"`).join('|')}`,
  })

  return z.NEVER
})

export const userFormSchema = z
  .object({
    email: z.string().trim().min(1, '이메일을 입력하세요.').email('이메일 형식이 올바르지 않습니다.'),
    empNo: z.string().trim().min(1, '사번을 입력하세요.'),
    initialPassword: z.string(),
    name: z.string().trim().min(1, '이름을 입력하세요.').max(50, '이름은 50자 이하로 입력하세요.'),
    passwordMode: z.enum(['AUTO', 'MANUAL']),
    rank: z.string(),
    role: z.enum(['ADMIN', 'HQ_MANAGER', 'HQ_STAFF', 'BRANCH_MANAGER', 'BRANCH_STAFF']),
    tenancyCode: z.string().min(1, '소속을 선택하세요.'),
  })
  .superRefine((values, context) => {
    if (
      values.passwordMode === 'MANUAL' &&
      !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(values.initialPassword)
    ) {
      context.addIssue({
        code: 'custom',
        message: '비밀번호는 영문 1자 이상, 숫자 1자 이상, 총 8자 이상이어야 합니다.',
        path: ['initialPassword'],
      })
    }
  })

export const userDetailFormSchema = z.object({
  email: z.string().trim().min(1, '이메일을 입력하세요.').email('이메일 형식이 올바르지 않습니다.'),
  name: z.string().trim().min(1, '이름을 입력하세요.').max(50, '이름은 50자 이하로 입력하세요.'),
  position: z.string().trim().max(50, '직급은 50자 이하로 입력하세요.'),
  role: userApiRoleSchema,
  tenancyCode: z.string().min(1, '소속을 선택하세요.'),
})

export type UserDetailFormInput = z.input<typeof userDetailFormSchema>
