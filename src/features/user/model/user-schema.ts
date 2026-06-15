import { z } from 'zod'

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
