import { z } from 'zod'

export const stockCreateSchema = z.object({
  itemName: z
    .string()
    .trim()
    .min(1, '부품명을 입력하세요.')
    .max(100, '부품명은 100자 이하로 입력하세요.'),
  itemUnit: z.enum(['EA', 'BOX', 'SET', 'L']),
  quantity: z
    .number({ message: '현재고를 입력하세요.' })
    .int('정수로 입력하세요.')
    .min(0, '현재고는 0 이상으로 입력하세요.'),
  safetyStock: z
    .number({ message: '안전재고를 입력하세요.' })
    .int('정수로 입력하세요.')
    .min(0, '안전재고는 0 이상으로 입력하세요.'),
  sku: z
    .string()
    .trim()
    .min(1, '부품 코드를 입력하세요.')
    .max(50, '부품 코드는 50자 이하로 입력하세요.'),
  warehouseCode: z.string().min(1, '창고를 선택하세요.'),
})

export type StockCreateSchema = z.infer<typeof stockCreateSchema>
