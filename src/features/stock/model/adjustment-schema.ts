import { z } from 'zod'

export const adjustmentFormSchema = z.object({
  adjustmentType: z.enum(['INCREASE', 'DECREASE', 'ADJUST']),
  note: z.string().trim().max(500, '메모는 500자 이하로 입력하세요.'),
  quantity: z
    .number({ message: '수량을 입력하세요.' })
    .int('정수로 입력하세요.')
    .min(0, '0 이상으로 입력하세요.'),
  reason: z.enum(['DAMAGE', 'LOST', 'FOUND'], { message: '사유를 선택하세요.' }),
  warehouseCode: z.string().min(1, '창고를 선택하세요.'),
})

export type AdjustmentFormSchema = z.infer<typeof adjustmentFormSchema>
