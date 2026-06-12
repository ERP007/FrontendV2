import { z } from 'zod'

export const soDraftFormSchema = z.object({
  desiredArrivalDate: z.string().min(1, '도착 희망일을 선택하세요.'),
  memo: z.string().max(500, '메모는 500자 이하로 입력하세요.').optional(),
  warehouseCode: z.string().min(1, '수신 창고를 선택하세요.'),
})

export type SoDraftFormValues = z.infer<typeof soDraftFormSchema>
