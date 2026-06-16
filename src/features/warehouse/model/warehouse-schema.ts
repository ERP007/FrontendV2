import { z } from 'zod'

export const warehouseFormSchema = z
  .object({
    address: z.string().trim().max(255, '주소는 255자 이하로 입력하세요.'),
    branchId: z.number().nullable(),
    code: z
      .string()
      .trim()
      .min(1, '창고 코드를 입력하세요.')
      .max(50, '창고 코드는 50자 이하로 입력하세요.'),
    name: z
      .string()
      .trim()
      .min(1, '창고명을 입력하세요.')
      .max(100, '창고명은 100자 이하로 입력하세요.'),
    type: z.enum(['HQ', 'DEALER']),
  })
  .superRefine((values, context) => {
    if (values.type === 'DEALER' && values.branchId === null) {
      context.addIssue({
        code: 'custom',
        message: '소속 지점을 선택하세요.',
        path: ['branchId'],
      })
    }
  })

export type WarehouseFormSchema = z.infer<typeof warehouseFormSchema>

export const branchFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '지점명을 입력하세요.')
    .max(100, '지점명은 100자 이하로 입력하세요.'),
})

export type BranchFormSchema = z.infer<typeof branchFormSchema>
