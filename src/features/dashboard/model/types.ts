export type TodoCategory = 'APPROVAL' | 'SHIP' | 'ARRIVAL'

/** 시점 긴급도: 지연(danger 점) / 오늘 / 일반 */
export type TodoUrgency = 'DELAYED' | 'TODAY' | 'NORMAL'

export interface TodoItem {
  category: TodoCategory
  id: number
  itemSummary: string
  /** 본사 발주 상세로 이동할 요청번호 */
  reqNo: string
  totalQuantity: number
  urgency: TodoUrgency
  /** 우측에 표시할 시점 라벨 (예: 'D+1', '오늘 12:08', '어제 17:30') */
  whenLabel: string
  warehouseName: string
}

export const TODO_CATEGORY_LABELS: Record<TodoCategory, string> = {
  APPROVAL: '승인 대기',
  ARRIVAL: '도착 지연',
  SHIP: '출고 대기',
}

/** swagger StockActivityResponse — 최근 7일 활동(일자별 입고/출고/조정 건수). */
export interface DailyActivity {
  /** 일자(ISO, 예: '2026-06-18'). 차트 x축에는 '일'(day-of-month)만 표시한다. */
  date: string
  inbound: number
  outbound: number
  adjust: number
}

export interface ActivitySummary {
  /** 집계 시작일(ISO, KST, to의 6일 전) */
  from: string
  /** 집계 종료일(ISO, KST, 오늘) */
  to: string
  /** from→to 오름차순 7개(이동이 없는 날도 0으로 포함) */
  days: DailyActivity[]
  totalInbound: number
  totalOutbound: number
  totalAdjust: number
}

export function activityGrandTotal(summary: ActivitySummary): number {
  return summary.totalInbound + summary.totalOutbound + summary.totalAdjust
}
