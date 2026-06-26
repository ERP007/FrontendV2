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
