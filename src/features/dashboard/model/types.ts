/**
 * 본사 대시보드(DA-01) 보조 KPI UI 모델 (구매·발주).
 *
 * 상단 재고 KPI 4종(총 SKU/부족/충족률/최근 7일 이동)은 features/stock의 StockKpi로 분리되어
 * `GET /inventory/stocks/kpi`(ADMIN·HQ는 전사 범위) 실데이터로 그린다(StockKpiCards 재사용).
 * 이 타입은 아직 연동 전이라 fixture로 채우는 구매·발주 KPI만 담는다:
 * - 구매 KPI 2종(진행 중 PO/도착 예정 PO) = Procurement 요약
 * - 발주 KPI 2종(승인 대기/출고 대기) = Sales 요약
 */
export interface DashboardKpi {
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
