import { Ban } from 'lucide-react'
import { useState } from 'react'

import { FgBadge, FgButton, FgModal, FgNotice, FgTextarea } from '@/shared/ui'

import type { SalesOrderDetail } from '../model/so-detail'

const MAX_REASON = 200

export interface SoCancelModalProps {
  isSubmitting?: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  open: boolean
  so: SalesOrderDetail
}

export function SoCancelModal({ isSubmitting, onClose, onConfirm, open, so }: SoCancelModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

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
            요청 취소
          </FgButton>
        </>
      }
      open={open}
      size="md"
      title="발주 요청 취소"
      titleMeta={<FgBadge variant="outline">{so.code}</FgBadge>}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <div className="flex flex-col gap-5">
        <FgNotice tone="danger">
          취소된 요청은 복원할 수 없습니다. 사유는 변경 이력에 기록됩니다.
        </FgNotice>
        <FgTextarea
          error={error ?? undefined}
          label="취소 사유"
          labelTrailing={`${reason.length} / ${MAX_REASON}`}
          maxLength={MAX_REASON}
          placeholder="중복 요청, 수량 정정 등"
          required
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
    </FgModal>
  )
}
