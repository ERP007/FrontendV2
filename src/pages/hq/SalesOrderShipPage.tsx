import { useNavigate, useParams, useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
  AlertTriangle,
  Building2,
  Calendar,
  Check,
  FileText,
  Truck,
  Warehouse as WarehouseIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

import {
  SALES_ORDER_FIXTURES,
  SoShipLines,
  soTotalApproved,
  TRANSPORT_OPTIONS,
} from '@/features/sales-order'
import { formatDateTime, formatDateWithDay, formatDday, formatNumber } from '@/shared/lib/format'
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

export function SalesOrderShipPage() {
  const params = useParams({ strict: false })
  const navigate = useNavigate()
  const router = useRouter()

  const so =
    SALES_ORDER_FIXTURES.find((order) => order.reqNo === params.soNo && order.status === 'APPROVED') ??
    SALES_ORDER_FIXTURES.find((order) => order.status === 'APPROVED') ??
    SALES_ORDER_FIXTURES[0]

  const [shippedMap, setShippedMap] = useState<Record<number, number>>(() =>
    Object.fromEntries(
      so.lines.map((line) => [line.lineNo, line.approvedQuantity ?? line.requestedQuantity]),
    ),
  )
  const [transport, setTransport] = useState<string>(TRANSPORT_OPTIONS[0])
  const [shipDate, setShipDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [invoiceNo, setInvoiceNo] = useState('')
  const [memo, setMemo] = useState('')

  const totalShipped = so.lines.reduce(
    (sum, line) => sum + (shippedMap[line.lineNo] ?? line.approvedQuantity ?? 0),
    0,
  )
  const negativeCount = so.lines.filter(
    (line) => line.availableStock - (shippedMap[line.lineNo] ?? 0) < 0,
  ).length

  function handleConfirm() {
    if (negativeCount > 0) {
      toast.error('잔여 재고가 음수인 라인이 있습니다. 출고 수량을 확인하세요.')
      return
    }
    toast.success(`${so.reqNo} 출고가 확정되었습니다. 출고 창고 재고가 차감됩니다.`)
    void navigate({ to: '/sales-orders' })
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        badge={
          <span className="flex items-center gap-2.5">
            <span className="text-h1 font-extrabold text-muted">출고 처리</span>
            <FgDomainStatusBadge status={so.status} />
          </span>
        }
        breadcrumbs={[
          { label: '발주' },
          { label: '발주 요청' },
          { label: `${so.reqNo} 출고 처리` },
        ]}
        title={so.reqNo}
      />

      <FgCard>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-section text-ink">발주 요약</h2>
          <span className="text-meta font-medium text-faint">
            승인 · {so.approvedAt ? formatDateTime(so.approvedAt) : '—'} · {so.approverName ?? '—'}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-x-6 gap-y-7">
          <InfoCell
            icon={<Building2 aria-hidden className="h-3.5 w-3.5" />}
            label="요청 지점"
            value={
              <span>
                {so.branchName}
                <span className="ml-1.5 text-meta font-medium text-faint">{so.branchCode}</span>
              </span>
            }
          />
          <InfoCell
            icon={<Calendar aria-hidden className="h-3.5 w-3.5" />}
            label="도착 희망일"
            value={
              <span>
                {formatDateWithDay(so.desiredAt)}
                <strong className="ml-1.5 text-primary-strong">{formatDday(so.desiredAt)}</strong>
              </span>
            }
          />
          <InfoCell
            icon={<WarehouseIcon aria-hidden className="h-3.5 w-3.5" />}
            label="출고 창고"
            value={
              <span>
                {so.shipWarehouseName ?? '본사 중앙창고'}
                <span className="ml-1.5 text-meta font-medium text-faint">
                  {so.shipWarehouseCode ?? 'WH-HQ-001'}
                </span>
              </span>
            }
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-meta text-faint">
              <Truck aria-hidden className="h-3.5 w-3.5" />
              운송 수단
            </p>
            <div className="mt-2">
              <FgSelect
                options={TRANSPORT_OPTIONS.map((option) => ({ label: option, value: option }))}
                value={transport}
                onValueChange={setTransport}
              />
            </div>
          </div>
        </div>
      </FgCard>

      <FgCard>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-section text-ink">출고 품목</h2>
            <FgBadge variant="outline">{so.lines.length} 라인</FgBadge>
          </div>
          <span className="text-meta font-medium text-faint">
            현재고 기준 · {so.shipWarehouseCode ?? 'WH-HQ-001'}
          </span>
        </div>
        <SoShipLines
          lines={so.lines}
          shippedMap={shippedMap}
          onChangeShipped={(lineNo, quantity) =>
            setShippedMap((previous) => ({ ...previous, [lineNo]: quantity }))
          }
        />
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-line-soft pt-4 text-label">
          <span className="font-medium text-muted">
            총 품목 수 <strong className="text-ink">{so.lines.length}종</strong>
            <span className="mx-2 text-line">|</span>
            승인 합계 <strong className="text-ink">{formatNumber(soTotalApproved(so.lines))}</strong>
            <span className="mx-2 text-line">|</span>
            출고 합계 <strong className="text-ink">{formatNumber(totalShipped)}</strong>
          </span>
          {negativeCount > 0 ? (
            <span className="flex items-center gap-1.5 text-meta font-bold text-warning">
              <AlertTriangle aria-hidden className="h-3.5 w-3.5" />
              잔여 음수 {negativeCount}건 — 확정 전 확인 필요
            </span>
          ) : null}
        </div>
      </FgCard>

      <FgCard>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-section text-ink">출고 정보</h2>
          <span className="text-meta font-medium text-faint">확정 시 재고 자동 차감 + 지점 알림 발송</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <FgInput
            label="출고 일자"
            leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
            required
            type="date"
            value={shipDate}
            onChange={(event) => setShipDate(event.target.value)}
          />
          <FgInput
            hint="선택"
            label="송장번호"
            leftIcon={<FileText aria-hidden className="h-4 w-4" />}
            placeholder="HMC-00000-000"
            value={invoiceNo}
            onChange={(event) => setInvoiceNo(event.target.value)}
          />
          <div className="col-span-2">
            <FgTextarea
              label="출고 메모"
              maxLength={200}
              placeholder="배송 시 유의사항, 차종별 우선순위 등"
              rows={3}
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
            />
          </div>
        </div>
      </FgCard>

      <FgCard className="flex items-center justify-between gap-4" compact>
        <span className="flex items-center gap-2 text-label font-semibold text-ink-2">
          <Check aria-hidden className="h-4 w-4 text-success" />
          본사 → {so.branchName} · {so.lines.length} 라인 {formatNumber(totalShipped)} EA
        </span>
        <span className="flex items-center gap-2.5">
          <FgButton variant="ghost" onClick={() => router.history.back()}>
            취소
          </FgButton>
          <FgButton
            leftIcon={<Truck aria-hidden className="h-4 w-4" />}
            variant="primary"
            onClick={handleConfirm}
          >
            출고 확정
          </FgButton>
        </span>
      </FgCard>
    </div>
  )
}
