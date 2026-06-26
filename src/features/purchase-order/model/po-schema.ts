import { z } from 'zod'

export const purchaseOrderDraftFormSchema = z.object({
  memo: z.string().trim().max(500, '메모는 500자 이하로 입력하세요.'),
  vendorCode: z.string().min(1, '공급사를 선택하세요.'),
  warehouseCode: z.string().min(1, '납품 창고를 선택하세요.'),
})

export type PurchaseOrderDraftFormValues = z.infer<typeof purchaseOrderDraftFormSchema>
