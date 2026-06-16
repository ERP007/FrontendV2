import { Ban } from 'lucide-react'
import { useEffect, useState } from 'react'

import { FgBadge, FgButton, FgModal, FgNotice, FgTextarea } from '@/shared/ui'

import type { PurchaseOrderDetail } from '../model/po-detail'

const MAX_REASON = 200

export interface PoCancelModalProps {
  isSubmitting?: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  open: boolean
  po: PurchaseOrderDetail
}

export function PoCancelModal({
  isSubmitting,
  onClose,
  onConfirm,
  open,
  po,
}: PoCancelModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setReason('')
      setError(null)
    }
  }, [open])

  function handleConfirm() {
    const trimmed = reason.trim()
    if (!trimmed) {
      setError('취소 사유를 입력하세요.')
      return
    }
    setError(null)
    onConfirm(trimmed)
  }

  return (
    <FgModal
      footer={
        <>
          <FgButton disabled={isSubmitting} onClick={onClose}>
            돌아가기
          </FgButton>
          <FgButton
            disabled={isSubmitting}
            leftIcon={<Ban aria-hidden className="h-4 w-4" />}
            variant="danger"
            onClick={handleConfirm}
          >
            주문 취소
          </FgButton>
        </>
      }
      open={open}
      size="md"
      title="구매 주문 취소"
      titleMeta={<FgBadge variant="outline">{po.code}</FgBadge>}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <div className="flex flex-col gap-5">
        <FgNotice tone="danger">
          취소된 주문은 복원할 수 없습니다. 사유는 변경 이력에 기록됩니다.
        </FgNotice>
        <FgTextarea
          error={error ?? undefined}
          label="취소 사유"
          labelTrailing={`${reason.length} / ${MAX_REASON}`}
          maxLength={MAX_REASON}
          placeholder="공급사 단가 미합의, 중복 발주 등"
          required
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
    </FgModal>
  )
}
