import { useNavigate, useParams, useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
  AlertTriangle,
  Calendar,
  Check,
  FileText,
  Lock,
  Truck,
  Warehouse as WarehouseIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

import {
  ARRIVAL_DIFF_REASON_OPTIONS,
  SALES_ORDER_FIXTURES,
  SoArrivalLines,
} from '@/features/sales-order'
import { formatDateTime, formatNumber } from '@/shared/lib/format'
import {
  FgBadge,
  FgButton,
  FgCard,
  FgDomainStatusBadge,
  FgInput,
  FgPageHeader,
  FgSelect,
  FgTextarea,
} from '@/shared/ui'

function InfoCell({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-meta text-faint">
        {icon}
        {label}
      </p>
      <div className="mt-2 text-body font-semibold text-ink">{value}</div>
    </div>
  )
}

export function BranchSalesOrderArrivalPage() {
  const params = useParams({ strict: false })
  const navigate = useNavigate()
  const router = useRouter()

  const so =
    SALES_ORDER_FIXTURES.find((order) => order.reqNo === params.soNo && order.status === 'SHIPPED') ??
    SALES_ORDER_FIXTURES.find((order) => order.status === 'SHIPPED') ??
    SALES_ORDER_FIXTURES[0]

  const [deliveredMap, setDeliveredMap] = useState<Record<number, number>>(() =>
    Object.fromEntries(
      so.lines.map((line) => [
        line.lineNo,
        line.shippedQuantity ?? line.approvedQuantity ?? line.requestedQuantity,
      ]),
    ),
  )
  const [arrivalDate, setArrivalDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [diffReason, setDiffReason] = useState('')
  const [memo, setMemo] = useState('')
  const [reasonError, setReasonError] = useState<string | undefined>(undefined)

  const shippedTotal = so.lines.reduce(
    (sum, line) => sum + (line.shippedQuantity ?? line.approvedQuantity ?? line.requestedQuantity),
    0,
  )
  const deliveredTotal = so.lines.reduce(
    (sum, line) =>
      sum +
      (deliveredMap[line.lineNo] ??
        line.shippedQuantity ??
        line.approvedQuantity ??
        line.requestedQuantity),
    0,
  )
  const diffTotal = deliveredTotal - shippedTotal
  const diffCount = so.lines.filter((line) => {
    const shipped = line.shippedQuantity ?? line.approvedQuantity ?? line.requestedQuantity
    return (deliveredMap[line.lineNo] ?? shipped) !== shipped
  }).length

  function handleConfirm() {
    if (diffCount > 0 && !diffReason) {
      setReasonError('차이 발생 시 사유 입력이 필수입니다.')
      return
    }
    toast.success(
      `${so.reqNo} 도착이 확정되었습니다. ${so.receiveWarehouseName} 재고에 +${formatNumber(deliveredTotal)} 반영됩니다.`,
    )
    void navigate({ to: '/branch/sales-orders' })
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        badge={
          <span className="flex items-center gap-2.5">
            <span className="text-h1 font-extrabold text-muted">도착 입고 확인</span>
            <FgDomainStatusBadge status={so.status} />
          </span>
        }
        breadcrumbs={[
          { label: '발주' },
          { label: '내 지점 발주 요청' },
          { label: `${so.reqNo} 도착 입고 확인` },
        ]}
        title={so.reqNo}
      />

      <FgCard>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-section text-ink">발주 요약</h2>
          <span className="text-meta font-medium text-faint">
            출고지 · {so.shipWarehouseName} ({so.shipWarehouseCode})
          </span>
        </div>
        <div className="grid grid-cols-4 gap-x-6 gap-y-7">
          <InfoCell
            icon={<Calendar aria-hidden className="h-3.5 w-3.5" />}
            label="본사 출고 일자"
            value={so.shippedAt ? formatDateTime(so.shippedAt) : '—'}
          />
          <InfoCell
            icon={<FileText aria-hidden className="h-3.5 w-3.5" />}
            label="송장번호"
            value={so.invoiceNo ?? '—'}
          />
          <InfoCell
            icon={<Truck aria-hidden className="h-3.5 w-3.5" />}
            label="운송 수단"
            value={so.transport ?? '—'}
          />
          <InfoCell
            icon={<WarehouseIcon aria-hidden className="h-3.5 w-3.5" />}
            label="수신 창고"
            value={
              <span>
                {so.receiveWarehouseName}
                <span className="ml-1.5 text-meta font-medium text-faint">{so.receiveWarehouseCode}</span>
              </span>
            }
          />
        </div>
      </FgCard>

      <FgCard>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-section text-ink">도착 품목 확인</h2>
            <FgBadge variant="outline">{so.lines.length} 라인</FgBadge>
            {diffCount > 0 ? <FgBadge variant="warning">차이 {diffCount}건</FgBadge> : null}
          </div>
          <span className="text-meta font-medium text-faint">
            기본 도착 수량 = 출고 수량 · 직접 카운트 후 수정
          </span>
        </div>
        <SoArrivalLines
          deliveredMap={deliveredMap}
          lines={so.lines}
          onChangeDelivered={(lineNo, quantity) =>
            setDeliveredMap((previous) => ({ ...previous, [lineNo]: quantity }))
          }
        />
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-line-soft pt-4 text-label">
          <span className="font-medium text-muted">
            총 품목 수 <strong className="text-ink">{so.lines.length}종</strong>
            <span className="mx-2 text-line">|</span>
            출고 합계 <strong className="text-ink">{formatNumber(shippedTotal)}</strong>
            <span className="mx-2 text-line">|</span>
            도착 합계 <strong className="text-ink">{formatNumber(deliveredTotal)}</strong>
            <span className="mx-2 text-line">|</span>
            차이 합계{' '}
            <strong className={diffTotal !== 0 ? 'text-danger' : 'text-ink'}>
              {diffTotal === 0 ? '±0' : formatNumber(diffTotal)}
            </strong>
          </span>
          <span className="text-meta font-medium text-faint">
            확정 시 {so.receiveWarehouseName} 재고 <strong className="text-success">+{formatNumber(deliveredTotal)}</strong>{' '}
            자동 반영
          </span>
        </div>
      </FgCard>

      <FgCard>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-section text-ink">도착 정보</h2>
          <span className="text-meta font-medium text-faint">확정 시 재고 자동 반영 + 본사 알림</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <FgInput
            label="도착 일자"
            leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
            required
            type="date"
            value={arrivalDate}
            onChange={(event) => setArrivalDate(event.target.value)}
          />
          <div className="space-y-2">
            <span className="block text-label text-ink-2">수령자</span>
            <div className="flex h-11 items-center justify-between gap-3 rounded-control border border-line bg-background px-3.5 text-body">
              <span className="font-semibold text-ink">
                정유진
                <span className="ml-1.5 text-meta font-medium text-faint">
                  {so.branchName} · 서비스 매니저
                </span>
              </span>
              <span className="flex items-center gap-1 text-meta font-semibold text-faint">
                <Lock aria-hidden className="h-3 w-3" />
                로그인 사용자
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <span className="block text-label text-ink-2">
              차이 사유{diffCount > 0 ? <span className="text-danger"> *</span> : null}
              <span className="ml-2 text-meta font-medium text-warning">차이 발생 시 필수</span>
            </span>
            <FgSelect
              disabled={diffCount === 0}
              error={reasonError}
              options={ARRIVAL_DIFF_REASON_OPTIONS.map((option) => ({ label: option, value: option }))}
              placeholder="사유 선택"
              value={diffReason || undefined}
              onValueChange={(value) => {
                setDiffReason(value)
                setReasonError(undefined)
              }}
            />
          </div>
          <FgTextarea
            label="메모"
            maxLength={300}
            placeholder="포장 상태, 파손 부위, 본사 전달 사항 등"
            rows={3}
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
          />
        </div>
      </FgCard>

      <FgCard className="flex items-center justify-between gap-4" compact>
        {diffCount > 0 ? (
          <span className="flex items-center gap-1.5 text-label font-bold text-warning">
            <AlertTriangle aria-hidden className="h-4 w-4" />
            차이 {diffCount}건 — 사유 입력 후 확정해 주세요
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-label font-semibold text-ink-2">
            <Check aria-hidden className="h-4 w-4 text-success" />
            전량 정상 도착 · {so.lines.length} 라인 {formatNumber(deliveredTotal)} EA
          </span>
        )}
        <span className="flex items-center gap-2.5">
          <FgButton variant="ghost" onClick={() => router.history.back()}>
            취소
          </FgButton>
          <FgButton
            leftIcon={<Check aria-hidden className="h-4 w-4" />}
            variant="primary"
            onClick={handleConfirm}
          >
            도착 확정
          </FgButton>
        </span>
      </FgCard>
    </div>
  )
}
