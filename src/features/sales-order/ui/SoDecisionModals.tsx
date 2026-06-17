import { Ban, Check } from 'lucide-react'
import { useState } from 'react'

import { formatNumber } from '@/shared/lib/format'
import { FgBadge, FgButton, FgModal, FgNotice, FgSelect, FgTextarea } from '@/shared/ui'

import { SO_HQ_WAREHOUSE_OPTIONS } from '../model/fixtures'
import { REJECT_REASON_OPTIONS, soShortageCount, soShortageTotal, soTotalApproved } from '../model/so-ui-model'

import type { SalesOrder } from '../model/so-ui-model'

export interface SoApproveModalProps {
  /** 검토 화면에서 조정된 승인 수량 맵 (lineNo → 수량) */
  approvedMap: Record<number, number>
  onClose: () => void
  onConfirm: (shipWarehouseCode: string) => void
  open: boolean
  so: SalesOrder
}

export function SoApproveModal({ approvedMap, onClose, onConfirm, open, so }: SoApproveModalProps) {
  const [warehouseCode, setWarehouseCode] = useState<string>(SO_HQ_WAREHOUSE_OPTIONS[0].code)

  function handleClose() {
    setWarehouseCode(SO_HQ_WAREHOUSE_OPTIONS[0].code)
    onClose()
  }

  const reviewedLines = so.lines.map((line) => ({
    ...line,
    approvedQuantity: approvedMap[line.lineNo] ?? line.requestedQuantity,
  }))
  const shortageCount = soShortageCount(reviewedLines)
  const shortageTotal = soShortageTotal(reviewedLines)

  return (
    <FgModal
      footer={
        <>
          <FgButton onClick={handleClose}>취소</FgButton>
          <FgButton
            leftIcon={<Check aria-hidden className="h-4 w-4" />}
            variant="primary"
            onClick={() => onConfirm(warehouseCode)}
          >
            승인 확정
          </FgButton>
        </>
      }
      icon={<Check aria-hidden className="h-5 w-5 text-success" />}
      open={open}
      size="sm"
      title="발주 승인"
      titleMeta={<FgBadge variant="outline">{so.reqNo}</FgBadge>}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose()
      }}
    >
      <div className="flex flex-col gap-5">
        <FgNotice tone="success">
          승인 시 출고 대기 상태로 전환되며 요청 지점에 알림이 전송됩니다.
        </FgNotice>
        <FgSelect
          label="출고 창고"
          options={SO_HQ_WAREHOUSE_OPTIONS.map((warehouse) => ({
            label: `${warehouse.name} ${warehouse.code}`,
            value: warehouse.code,
          }))}
          required
          value={warehouseCode}
          onValueChange={setWarehouseCode}
        />
        <div className="divide-y divide-line-soft rounded-control border border-line">
          <div className="flex items-center justify-between px-4 py-3 text-label">
            <span className="font-medium text-muted">총 품목 수</span>
            <span className="font-bold text-ink">{so.lines.length}종</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-label">
            <span className="font-medium text-muted">승인 합계</span>
            <span className="font-bold text-ink">{formatNumber(soTotalApproved(reviewedLines))} EA</span>
          </div>
          <div className="flex items-center justify-between bg-warning-bg px-4 py-3 text-label">
            <span className="font-medium text-warning">재고 부족 라인</span>
            <span className="font-bold text-danger">
              {shortageCount}건 {shortageCount > 0 ? `(${formatNumber(shortageTotal)})` : ''}
            </span>
          </div>
        </div>
      </div>
    </FgModal>
  )
}

export interface SoRejectModalProps {
  onClose: () => void
  onConfirm: (reason: string, note: string) => void
  open: boolean
  so: SalesOrder
}

export function SoRejectModal({ onClose, onConfirm, open, so }: SoRejectModalProps) {
  const [reason, setReason] = useState<string>('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)

  function handleClose() {
    setReason('')
    setNote('')
    setError(undefined)
    onClose()
  }

  function handleConfirm() {
    if (!reason) {
      setError('거절 사유를 선택하세요.')
      return
    }
    onConfirm(reason, note)
  }

  return (
    <FgModal
      footer={
        <>
          <FgButton onClick={handleClose}>취소</FgButton>
          <FgButton
            leftIcon={<Ban aria-hidden className="h-4 w-4" />}
            variant="dangerSolid"
            onClick={handleConfirm}
          >
            거절 확정
          </FgButton>
        </>
      }
      icon={<Ban aria-hidden className="h-5 w-5 text-danger" />}
      open={open}
      size="sm"
      title="거절 사유"
      titleMeta={<FgBadge variant="outline">{so.reqNo}</FgBadge>}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose()
      }}
    >
      <div className="flex flex-col gap-5">
        <FgNotice tone="danger">거절 시 요청자에게 즉시 알림됩니다.</FgNotice>
        <FgSelect
          error={error}
          label="사유"
          options={REJECT_REASON_OPTIONS.map((option) => ({ label: option, value: option }))}
          placeholder="사유 선택"
          required
          value={reason || undefined}
          onValueChange={(value) => {
            setReason(value)
            setError(undefined)
          }}
        />
        <FgTextarea
          label="메모"
          placeholder="요청자에게 전달할 상세 사유를 입력하세요"
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
    </FgModal>
  )
}
