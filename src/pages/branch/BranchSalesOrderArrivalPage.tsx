import { useNavigate, useParams, useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Calendar, Check, FileText, Lock, Truck, Warehouse as WarehouseIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

import {
  CARRIER_TYPE_LABELS,
  MOCK_BRANCH_SALES_ORDER_DETAIL,
  useSalesOrderDeliverMutation,
} from '@/features/sales-order'
import type { BranchSalesOrderDetail } from '@/features/sales-order'
import { useMeQuery } from '@/features/user'
import { formatDate, formatNumber, formatTime } from '@/shared/lib/format'
import {
  FgBadge,
  FgButton,
  FgCard,
  FgDomainStatusBadge,
  FgInput,
  FgPageHeader,
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

  const so: BranchSalesOrderDetail = {
    ...MOCK_BRANCH_SALES_ORDER_DETAIL,
    code: params.soNo ?? MOCK_BRANCH_SALES_ORDER_DETAIL.code,
  }
  const { data: me } = useMeQuery()

  const [arrivalDate, setArrivalDate] = useState(dayjs().format('YYYY-MM-DD'))

  const deliverMutation = useSalesOrderDeliverMutation(so.code)

  const totalQuantity = so.lines.reduce((sum, line) => sum + line.requestQuantity, 0)

  async function handleConfirm() {
    try {
      const result = await deliverMutation.mutateAsync({ deliveredDate: arrivalDate })
      toast.success(
        `${result.code} 도착이 확정되었습니다.`,
      )
      void navigate({ to: '/branch/sales-orders' })
    } catch {
      // 전역 인터셉터가 toast 처리
    }
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
          { label: `${so.code} 도착 입고 확인` },
        ]}
        title={so.code}
      />

      <FgCard>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-section text-ink">발주 요약</h2>
          <span className="text-meta font-medium text-faint">
            출고지 · {so.fromWarehouse.name} ({so.fromWarehouse.code})
          </span>
        </div>
        <div className="grid grid-cols-4 gap-x-6 gap-y-7">
          <InfoCell
            icon={<Calendar aria-hidden className="h-3.5 w-3.5" />}
            label="본사 출고 일자"
            value={
              so.approvedAt ? (
                <span>
                  {formatDate(so.approvedAt)}
                  <span className="ml-1.5 text-meta font-medium text-faint">
                    {formatTime(so.approvedAt)}
                  </span>
                </span>
              ) : (
                '—'
              )
            }
          />
          <InfoCell
            icon={<FileText aria-hidden className="h-3.5 w-3.5" />}
            label="송장번호"
            value={so.invoiceNumber ?? '—'}
          />
          <InfoCell
            icon={<Truck aria-hidden className="h-3.5 w-3.5" />}
            label="운송 수단"
            value={so.carrierType ? CARRIER_TYPE_LABELS[so.carrierType] : '—'}
          />
          <InfoCell
            icon={<WarehouseIcon aria-hidden className="h-3.5 w-3.5" />}
            label="수신 창고"
            value={
              <span>
                {so.toWarehouse.name}
                <span className="ml-1.5 text-meta font-medium text-faint">{so.toWarehouse.code}</span>
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
          </div>
          <span className="text-meta font-medium text-faint">출고 수량 기준으로 자동 확정</span>
        </div>
        <div className="overflow-hidden rounded-control border border-line">
          <table className="w-full text-label">
            <thead className="bg-background text-table text-faint">
              <tr>
                <th className="px-4 py-3 text-left">부품</th>
                <th className="w-24 px-4 py-3 text-center">단위</th>
                <th className="w-32 px-4 py-3 text-right">출고 수량</th>
                <th className="w-32 px-4 py-3 text-right">도착 수량</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {so.lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-3">
                    <span className="block font-semibold text-ink">{line.itemName}</span>
                    <span className="block text-meta font-medium text-faint">{line.itemCode}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-ink-2">{line.unit}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink-2">
                    {formatNumber(line.requestQuantity)}
                    <span className="ml-1 text-meta font-medium text-faint">{line.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-ink">
                    {formatNumber(line.requestQuantity)}
                    <span className="ml-1 text-meta font-medium text-faint">{line.unit}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-line-soft pt-4 text-label">
          <span className="font-medium text-muted">
            총 품목 수 <strong className="text-ink">{so.lines.length}종</strong>
            <span className="mx-2 text-line">|</span>
            출고 합계 <strong className="text-ink">{formatNumber(totalQuantity)}</strong>
            <span className="mx-2 text-line">|</span>
            도착 합계 <strong className="text-ink">{formatNumber(totalQuantity)}</strong>
          </span>
          <span className="text-meta font-medium text-faint">
            확정 시 {so.toWarehouse.name} 재고 <strong className="text-success">+{formatNumber(totalQuantity)}</strong> 자동 반영
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
                {me?.name ?? '—'}
                <span className="ml-1.5 text-meta font-medium text-faint">
                  {me?.tenancyName ?? '—'} · {me?.position ?? '—'}
                </span>
              </span>
              <span className="flex items-center gap-1 text-meta font-semibold text-faint">
                <Lock aria-hidden className="h-3 w-3" />
                로그인 사용자
              </span>
            </div>
          </div>
        </div>
      </FgCard>

      <FgCard className="flex items-center justify-between gap-4" compact>
        <span className="flex items-center gap-1.5 text-label font-semibold text-ink-2">
          <Check aria-hidden className="h-4 w-4 text-success" />
          전량 정상 도착 · {so.lines.length} 라인 {formatNumber(totalQuantity)}
        </span>
        <span className="flex items-center gap-2.5">
          <FgButton variant="ghost" onClick={() => router.history.back()}>
            취소
          </FgButton>
          <FgButton
            disabled={deliverMutation.isPending}
            leftIcon={<Check aria-hidden className="h-4 w-4" />}
            variant="primary"
            onClick={() => void handleConfirm()}
          >
            도착 확정
          </FgButton>
        </span>
      </FgCard>
    </div>
  )
}
