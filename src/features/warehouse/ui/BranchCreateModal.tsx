import { Building2, Check } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { FgButton, FgInput, FgModal, FgNotice } from '@/shared/ui'

const FORM_ID = 'branch-form'

export interface BranchCreateModalProps {
  onClose: () => void
  onSubmit: (name: string) => void
  open: boolean
}

export function BranchCreateModal({ onClose, onSubmit, open }: BranchCreateModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)

  function handleClose() {
    setName('')
    setError(undefined)
    onClose()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()

    if (!trimmed) {
      setError('지점명을 입력하세요.')
      return
    }
    if (trimmed.length > 100) {
      setError('지점명은 100자 이하로 입력하세요.')
      return
    }

    onSubmit(trimmed)
  }

  return (
    <FgModal
      footer={
        <>
          <FgButton onClick={handleClose}>취소</FgButton>
          <FgButton
            form={FORM_ID}
            leftIcon={<Check aria-hidden className="h-4 w-4" />}
            type="submit"
            variant="primary"
          >
            등록
          </FgButton>
        </>
      }
      open={open}
      size="sm"
      title="지점 추가"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose()
      }}
    >
      <form className="flex flex-col gap-5" id={FORM_ID} onSubmit={handleSubmit}>
        <FgNotice tone="locked">관리자(ADMIN)만 지점을 추가할 수 있습니다.</FgNotice>
        <FgInput
          error={error}
          hint="예) 서울 강남지점"
          label="지점명"
          leftIcon={<Building2 aria-hidden className="h-4 w-4" />}
          placeholder="지점명을 입력하세요"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </form>
    </FgModal>
  )
}
