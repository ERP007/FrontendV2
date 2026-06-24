import { Ban } from 'lucide-react'
import { useState } from 'react'

import { FgBadge, FgButton, FgModal, FgNotice, FgSelect, FgTextarea } from '@/shared/ui'

import { REJECT_REASON_CATEGORY_LABELS } from '../model/ui-types'
import type { SalesOrderDetail } from '../model/so-detail'
import type { RejectReasonCategory } from '../model/types'

const MAX_MEMO = 500

const REASON_OPTIONS = (Object.keys(REJECT_REASON_CATEGORY_LABELS) as RejectReasonCategory[]).map(
  (value) => ({ label: REJECT_REASON_CATEGORY_LABELS[value], value }),
)

export interface SoRejectModalProps {
  isSubmitting?: boolean
  onClose: () => void
  onConfirm: (reasonCategory: RejectReasonCategory, memo: string | null) => void
  open: boolean
  so: SalesOrderDetail
}

export function SoRejectModal({ isSubmitting, onClose, onConfirm, open, so }: SoRejectModalProps) {
  const [reasonCategory, setReasonCategory] = useState<RejectReasonCategory | ''>('')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleConfirm() {
    if (!reasonCategory) {
      setError('거절 사유를 선택하세요.')
      return
    }
    setError(null)
    const trimmed = memo.trim()
    onConfirm(reasonCategory, trimmed ? trimmed : null)
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
            요청 거절
          </FgButton>
        </>
      }
      open={open}
      size="md"
      title="발주 요청 거절"
      titleMeta={<FgBadge variant="outline">{so.code}</FgBadge>}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <div className="flex flex-col gap-5">
        <FgNotice tone="danger">거절 시 요청자에게 알림이 전송되며 사유는 이력에 기록됩니다.</FgNotice>
        <FgSelect
          error={error ?? undefined}
          label="거절 사유"
          options={REASON_OPTIONS}
          placeholder="사유를 선택하세요"
          required
          value={reasonCategory || undefined}
          onValueChange={(value) => setReasonCategory(value as RejectReasonCategory)}
        />
        <FgTextarea
          label="메모 (선택)"
          labelTrailing={`${memo.length} / ${MAX_MEMO}`}
          maxLength={MAX_MEMO}
          placeholder="요청자에게 전달할 추가 설명"
          rows={4}
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
        />
      </div>
    </FgModal>
  )
}
