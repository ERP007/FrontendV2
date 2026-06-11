import { TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts'

import { formatNumber } from '@/shared/lib/format'
import { FgCard, FgCardHeader } from '@/shared/ui'

import { activityGrandTotal } from '../model/types'

import type { ActivitySummary } from '../model/types'

/**
 * 차트 색상 — SVG fill은 Tailwind 토큰 클래스를 받을 수 없어
 * 디자인 토큰(brand / brandLine)의 hex를 여기 한 곳에서만 참조한다.
 * (tailwind.config theme.extend.colors와 동일 값)
 */
const CHART_COLORS = {
  adjust: '#CFE3E8', // brandLine — 조정
  flow: '#0E6E83', // brand — 입·출고
} as const

interface ChartDatum {
  adjust: number
  day: string
  flow: number
}

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

export function ActivityChart({ summary }: { summary: ActivitySummary }) {
  const data = useMemo<ChartDatum[]>(
    () =>
      summary.daily.map((entry) => ({
        adjust: entry.adjust,
        day: entry.day,
        flow: entry.inbound + entry.outbound,
      })),
    [summary],
  )

  return (
    <FgCard className="flex h-full flex-col">
      <FgCardHeader
        actions={
          <div className="flex items-center gap-3.5">
            <LegendDot color={CHART_COLORS.flow} label="입·출고" />
            <LegendDot color={CHART_COLORS.adjust} label="조정" />
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
            <Bar
              dataKey="flow"
              isAnimationActive={false}
              maxBarSize={40}
              radius={[0, 0, 0, 0]}
              stackId="activity"
            >
              {data.map((entry) => (
                <Cell key={entry.day} fill={CHART_COLORS.flow} />
              ))}
            </Bar>
            <Bar
              dataKey="adjust"
              isAnimationActive={false}
              maxBarSize={40}
              radius={[4, 4, 0, 0]}
              stackId="activity"
            >
              {data.map((entry) => (
                <Cell key={entry.day} fill={CHART_COLORS.adjust} />
              ))}
            </Bar>
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
