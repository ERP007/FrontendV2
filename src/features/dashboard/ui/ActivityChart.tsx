import dayjs from 'dayjs'
import { TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import { formatNumber } from '@/shared/lib/format'
import { FgCard, FgCardHeader } from '@/shared/ui'

import { activityGrandTotal } from '../model/types'

import type { ActivitySummary } from '../model/types'

/**
 * 차트 색상 — SVG fill은 Tailwind 토큰 클래스를 받을 수 없어 디자인 토큰의 hex를 여기 한 곳에서만 참조한다.
 * (tailwind.config theme.extend.colors와 동일 값: brand / warning-dot / off-dot)
 */
const CHART_COLORS = {
  inbound: '#0E6E83', // brand — 입고
  outbound: '#D08A33', // warning-dot — 출고
  adjust: '#9AA8B0', // off-dot — 조정
} as const

interface ChartDatum {
  day: string
  inbound: number
  outbound: number
  adjust: number
}

/** 범례·툴팁 공통 행 정의(색·키·라벨). */
const SERIES = [
  { color: CHART_COLORS.inbound, key: 'inbound', label: '입고' },
  { color: CHART_COLORS.outbound, key: 'outbound', label: '출고' },
  { color: CHART_COLORS.adjust, key: 'adjust', label: '조정' },
] as const

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-meta font-medium text-muted">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function SummaryCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-control border border-line bg-background px-4 py-3 text-center">
      <p className="text-meta font-medium text-faint">{label}</p>
      <p className="mt-1 text-section font-extrabold text-ink">{formatNumber(value)}</p>
    </div>
  )
}

/** 막대 hover 시 해당 "일"의 입고·출고·조정 건수만 간단히 보여준다. */
function ActivityTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean
  label?: string
  payload?: Array<{ payload: ChartDatum }>
}) {
  if (!active || !payload?.length) {
    return null
  }
  const datum = payload[0].payload
  return (
    <div className="rounded-control border border-line bg-surface px-3 py-2 text-meta shadow-popover">
      <p className="mb-1 font-semibold text-ink">{label}일</p>
      <div className="flex flex-col gap-1">
        {SERIES.map((series) => (
          <span key={series.key} className="flex items-center gap-1.5 text-muted">
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: series.color }} />
            {series.label}
            <span className="ml-auto pl-3 font-semibold text-ink">{formatNumber(datum[series.key])}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function ActivityChart({ summary }: { summary: ActivitySummary }) {
  // 막대 x축은 폭이 좁아 일(day-of-month)만 표시한다. 입고/출고/조정은 세로로 누적(stacked).
  const data = useMemo<ChartDatum[]>(
    () =>
      summary.days.map((entry) => ({
        adjust: entry.adjust,
        day: dayjs(entry.date).format('D'),
        inbound: entry.inbound,
        outbound: entry.outbound,
      })),
    [summary],
  )

  return (
    <FgCard className="flex h-full flex-col">
      <FgCardHeader
        actions={
          <div className="flex items-center gap-3.5">
            {SERIES.map((series) => (
              <LegendDot key={series.key} color={series.color} label={series.label} />
            ))}
          </div>
        }
        icon={<TrendingUp aria-hidden className="h-4 w-4" />}
        title="최근 7일 활동"
      />
      <p className="mb-2">
        <span className="text-kpi text-ink">{formatNumber(activityGrandTotal(summary))}</span>
        <span className="ml-1.5 text-label font-medium text-muted">건</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height={200} width="100%">
          <BarChart barCategoryGap="28%" data={data} margin={{ bottom: 0, left: 0, right: 0, top: 8 }}>
            <XAxis
              axisLine={false}
              dataKey="day"
              tick={{ fill: '#93A3AC', fontSize: 12, fontWeight: 600 }}
              tickLine={false}
            />
            <Tooltip content={<ActivityTooltip />} cursor={{ fill: 'rgba(19, 32, 42, 0.04)' }} />
            <Bar
              dataKey="inbound"
              fill={CHART_COLORS.inbound}
              isAnimationActive={false}
              maxBarSize={40}
              stackId="activity"
            />
            <Bar
              dataKey="outbound"
              fill={CHART_COLORS.outbound}
              isAnimationActive={false}
              maxBarSize={40}
              stackId="activity"
            />
            <Bar
              dataKey="adjust"
              fill={CHART_COLORS.adjust}
              isAnimationActive={false}
              maxBarSize={40}
              radius={[4, 4, 0, 0]}
              stackId="activity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <SummaryCell label="입고" value={summary.totalInbound} />
        <SummaryCell label="출고" value={summary.totalOutbound} />
        <SummaryCell label="조정" value={summary.totalAdjust} />
      </div>
    </FgCard>
  )
}
