import { z } from 'zod'

export const soDraftFormSchema = z.object({
  memo: z.string().max(500, '메모는 500자 이하로 입력하세요.').optional(),
  warehouseCode: z.string().min(1, '입고 창고를 선택하세요.'),
})

export type SoFormValues = z.infer<typeof soDraftFormSchema>
