import { useNavigate, useParams } from '@tanstack/react-router'
import { Ban, Calendar, Edit3, FileText, PackageCheck, Send, Truck, Warehouse as WarehouseIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

import { CARRIER_TYPE_LABELS, SoHistoryTimeline } from '@/features/sales-order'
import type { BranchSalesOrderDetail } from '@/features/sales-order'
import { formatDate, formatNumber, formatTime } from '@/shared/lib/format'
import { FgBadge, FgButton, FgCard, FgDomainStatusBadge, FgPageHeader } from '@/shared/ui'

const MOCK_SO: BranchSalesOrderDetail = {
  approvedAt: '2026-06-12T09:25:00.000Z',
  carrierType: 'VEHICLE',
  code: 'SO-2026-0001',
  fromWarehouse: { code: 'WH-HQ-001', name: '본사 중앙창고' },
  invoiceNumber: 'HMC-44219-026',
  lines: [
    { id: 1, itemCode: 'HMC-EN-00214', itemName: '엔진오일 필터 (2.0L gasoline)', requestQuantity: 80, unit: 'EA' },
    { id: 2, itemCode: 'HMC-BR-01102', itemName: '브레이크 패드 세트 (전륜)', requestQuantity: 40, unit: 'SET' },
    { id: 3, itemCode: 'HMC-EN-10331', itemName: '에어 클리너 카트리지', requestQuantity: 60, unit: 'EA' },
    { id: 4, itemCode: 'HMC-SP-00673', itemName: '스파크 플러그 (이리듐)', requestQuantity: 48, unit: 'EA' },
    { id: 5, itemCode: 'HMC-AC-40229', itemName: '와이퍼 블레이드 24"', requestQuantity: 10, unit: 'EA' },
    { id: 6, itemCode: 'HMC-CL-50710', itemName: '엔진 쿨런트 1L', requestQuantity: 10, unit: 'L' },
  ],
  status: 'DRAFT',
  toWarehouse: { code: 'WH-04A', name: '강남 1지점 · 부품창고' },
}

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

export function BranchSalesOrderDetailPage() {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const so: BranchSalesOrderDetail = { ...MOCK_SO, code: params.soNo ?? MOCK_SO.code }

  function renderActions() {
    if (so.status === 'DRAFT') {
      return (
        <>
          <FgButton
            leftIcon={<Edit3 aria-hidden className="h-4 w-4" />}
            onClick={() => toast.info('수정 화면은 준비 중입니다.')}
          >
            수정하기
          </FgButton>
          <FgButton
            leftIcon={<Send aria-hidden className="h-4 w-4" />}
            variant="primary"
            onClick={() => toast.info('제출 API 연결 예정입니다.')}
          >
            제출하기
          </FgButton>
        </>
      )
    }
    if (so.status === 'REQUESTED') {
      return (
        <FgButton
          leftIcon={<Ban aria-hidden className="h-4 w-4" />}
          variant="danger"
          onClick={() => toast.info('취소 API 연결 예정입니다.')}
        >
          취소하기
        </FgButton>
      )
    }
    if (so.status === 'APPROVED') {
      return (
        <FgButton
          leftIcon={<PackageCheck aria-hidden className="h-4 w-4" />}
          variant="primary"
          onClick={() =>
            void navigate({
              params: { soNo: so.code },
              to: '/branch/sales-orders/$soNo/arrival',
            })
          }
        >
          입고하기
        </FgButton>
      )
    }
    return null
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={renderActions()}
        badge={<FgDomainStatusBadge status={so.status} />}
        breadcrumbs={[
          { label: '발주' },
          { label: '내 지점 발주 요청' },
          { label: so.code },
        ]}
        title={so.code}
      />

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1 space-y-5">
          <FgCard>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-section text-ink">발주 요약</h2>
              <span className="text-meta font-medium text-faint">
                출고지 · {so.toWarehouse.name} ({so.toWarehouse.code})
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
                    {so.fromWarehouse.name}
                    <span className="ml-1.5 text-meta font-medium text-faint">{so.fromWarehouse.code}</span>
                  </span>
                }
              />
            </div>
          </FgCard>

          <FgCard>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <h2 className="text-section text-ink">요청 품목</h2>
                <FgBadge variant="outline">{so.lines.length} 라인</FgBadge>
              </div>
            </div>
            <div className="overflow-hidden rounded-control border border-line">
              <table className="w-full text-label">
                <thead className="bg-background text-table text-faint">
                  <tr>
                    <th className="px-4 py-3 text-left">부품</th>
                    <th className="w-24 px-4 py-3 text-center">단위</th>
                    <th className="w-32 px-4 py-3 text-right">요청 수량</th>
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
                      <td className="px-4 py-3 text-right font-bold text-ink">
                        {formatNumber(line.requestQuantity)}
                        <span className="ml-1 text-meta font-medium text-faint">{line.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FgCard>
        </div>

        <div className="w-96 shrink-0">
          <SoHistoryTimeline code={so.code} />
        </div>
      </div>
    </div>
  )
}
