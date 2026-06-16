import { z } from 'zod'

export const purchaseOrderDraftFormSchema = z.object({
  desiredArrivalDate: z.string().min(1, '도착 예정일을 선택하세요.'),
  memo: z.string().trim().max(500, '메모는 500자 이하로 입력하세요.'),
  vendorCode: z.string().min(1, '공급사를 선택하세요.'),
  warehouseCode: z.string().min(1, '납품 창고를 선택하세요.'),
})

export type PurchaseOrderDraftFormValues = z.infer<typeof purchaseOrderDraftFormSchema>
