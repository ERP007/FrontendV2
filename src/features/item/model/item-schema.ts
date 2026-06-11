import { z } from 'zod'

export const itemFormSchema = z.object({
  autoGenerateCode: z.boolean(),
  code: z.string().trim().min(1, '부품 코드를 입력하세요.').max(50, '부품 코드는 50자 이하로 입력하세요.'),
  defaultSafetyStock: z
    .number({ message: '안전재고 기본값을 입력하세요.' })
    .int('정수로 입력하세요.')
    .min(0, '0 이상으로 입력하세요.'),
  description: z.string().trim().max(500, '설명은 500자 이하로 입력하세요.'),
  majorCategory: z.string().min(1, '대분류를 선택하세요.'),
  middleCategory: z.string().min(1, '중분류를 선택하세요.'),
  name: z.string().trim().min(1, '부품명을 입력하세요.').max(100, '부품명은 100자 이하로 입력하세요.'),
  unit: z.enum(['EA', 'BOX', 'SET', 'L']),
})
