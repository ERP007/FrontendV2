import dayjs from 'dayjs'
import { Calendar, Check } from 'lucide-react'
import { useState } from 'react'

import { formatCurrency, formatNumber } from '@/shared/lib/format'
import { FgBadge, FgButton, FgInput, FgModal, FgNotice } from '@/shared/ui'

import { poTotalAmount, poTotalQuantity } from '../model/ui-mock-types'

import type { PurchaseOrder } from '../model/ui-mock-types'

export interface PoReceiveModalProps {
  onClose: () => void
  onConfirm: (receivedDate: string) => void
  open: boolean
  po: PurchaseOrder
}

export function PoReceiveModal({ onClose, onConfirm, open, po }: PoReceiveModalProps) {
  const [receivedDate, setReceivedDate] = useState(() => dayjs().format('YYYY-MM-DD'))

  function handleClose() {
    setReceivedDate(dayjs().format('YYYY-MM-DD'))
    onClose()
  }

  return (
    <FgModal
      footer={
        <>
          <FgButton onClick={handleClose}>취소</FgButton>
          <FgButton
            leftIcon={<Check aria-hidden className="h-4 w-4" />}
            variant="primary"
            onClick={() => onConfirm(receivedDate)}
          >
            입고 완료
          </FgButton>
        </>
      }
      open={open}
      size="md"
      title="입고 처리"
      titleMeta={<FgBadge variant="outline">{po.poNo}</FgBadge>}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose()
      }}
    >
      <div className="flex flex-col gap-5">
        <FgInput
          label="입고 일자"
          leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
          type="date"
          value={receivedDate}
          onChange={(event) => setReceivedDate(event.target.value)}
        />
        <FgNotice tone="info">
          부분 입고는 지원하지 않습니다. 발주 전체 수량이 한 번에 입고 처리됩니다.
        </FgNotice>
        <div>
          <p className="mb-2.5 text-label font-semibold text-ink-2">입고 품목</p>
          <div className="overflow-hidden rounded-control border border-line">
            <div className="flex items-center gap-3 border-b border-line bg-background px-4 py-2.5 text-table text-faint">
              <span className="flex-1">부품</span>
              <span className="w-14 text-center">단위</span>
              <span className="w-24 text-right">입고 수량</span>
            </div>
            <div className="divide-y divide-line-soft">
              {po.lines.map((line) => (
                <div key={line.lineNo} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex min-w-0 flex-1 items-baseline gap-2">
                    <span className="truncate text-label font-semibold text-ink">{line.itemName}</span>
                    <span className="shrink-0 text-meta font-medium text-faint">{line.sku}</span>
                  </span>
                  <span className="w-14 text-center text-label font-medium text-ink-2">{line.unit}</span>
                  <span className="w-24 text-right text-label font-bold text-ink">
                    {formatNumber(line.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-line bg-background px-4 py-3 text-label">
              <span className="font-medium text-muted">총 {po.lines.length}종 · 입고 수량 합계</span>
              <span className="text-body font-bold text-primary-strong">
                {formatNumber(poTotalQuantity(po.lines))}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-label">
          <span className="font-medium text-muted">총 금액</span>
          <span className="text-body font-bold text-primary-strong">
            {formatCurrency(poTotalAmount(po.lines))}
          </span>
        </div>
      </div>
    </FgModal>
  )
}
