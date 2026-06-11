/**
 * 본사 대시보드(DA-01) UI 모델.
 *
 * 대시보드는 여러 서비스의 집계를 한 화면에 모은다:
 * - 재고 KPI 4종(총 SKU/부족/무재고/최근 7일 조정) = Inventory `GET /inventory/stocks/kpi`
 *   (swagger StockKpiResponse: totalSkuCount/lowStockCount/noStockCount/recentAdjustCount)
 * - 구매 KPI 2종(진행 중 PO/도착 예정 PO) = Procurement 요약
 * - 발주 KPI 2종(승인 대기/출고 대기) = Sales 요약
 * 집계 범위는 본사 전체(전 지점)이므로 목록 화면의 표본 fixture보다 큰 수치를 가진다.
 */
export interface DashboardKpi {
  /** 재고 — 총 SKU 포지션 수 */
  totalSkuCount: number
  /** 재고 — 안전재고 미만 부족 포지션 수 */
  lowStockCount: number
  /** 재고 — 무재고 포지션 수 */
  noStockCount: number
  /** 재고 — 최근 7일 조정 건수 */
  recentAdjustCount: number
  /** 재고 — 최근 7일 조정 전주 대비 증감 */
  adjustDelta: number
  /** 구매 — 진행 중(DRAFT/APPROVED/SHIPPED) 구매 PO 수 */
  activePoCount: number
  /** 구매 — 진행 중 PO 총 발주 금액 합 */
  activePoAmount: number
  /** 구매 — 도착 예정 PO 수 */
  arrivingPoCount: number
  /** 구매 — 도착 예정 PO 중 지연 건수 */
  delayedPoCount: number
  /** 발주 — 승인 대기(REQUESTED) 발주 수 */
  pendingApprovalCount: number
  /** 발주 — 승인 대기 평균 대기 시간(시간) */
  avgApprovalWaitHours: number
  /** 발주 — 출고 대기(APPROVED) 발주 수 */
  pendingShipCount: number
}

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

/** 최근 7일 활동 — 일자별 입고/출고/조정 건수 */
export interface DailyActivity {
  /** 막대 x축 라벨 (일자, 예: '15') */
  day: string
  adjust: number
  inbound: number
  outbound: number
}

export interface ActivitySummary {
  daily: DailyActivity[]
  totalAdjust: number
  totalInbound: number
  totalOutbound: number
}

export function activityGrandTotal(summary: ActivitySummary): number {
  return summary.totalInbound + summary.totalOutbound + summary.totalAdjust
}
