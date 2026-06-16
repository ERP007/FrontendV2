import { Check, Clock, KeyRound } from 'lucide-react'

import { FgButton, FgModal, FgNotice } from '@/shared/ui'

import type { UserListItem } from '../model/types'

export interface UserPasswordResetModalProps {
  errorMessage?: string | null
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
  open: boolean
  user: UserListItem | null
}

export function UserPasswordResetModal({
  errorMessage,
  loading = false,
  onClose,
  onConfirm,
  open,
  user,
}: UserPasswordResetModalProps) {
  const titleMeta = user ? (
    <span className="rounded-control bg-line-soft px-2 py-1 text-label font-semibold text-muted">
      {user.employeeNo.toUpperCase()}
    </span>
  ) : null

  return (
    <FgModal
      footer={
        <div className="flex w-full items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-meta text-faint">
            <Clock aria-hidden className="h-3.5 w-3.5" />
            초기화 후 사용자는 첫 로그인 시 비밀번호를 변경해야 합니다.
          </span>
          <span className="flex items-center gap-2">
            <FgButton disabled={loading} onClick={onClose}>
              취소
            </FgButton>
            <FgButton
              leftIcon={<Check aria-hidden className="h-4 w-4" />}
              loading={loading}
              variant="primary"
              onClick={onConfirm}
            >
              초기화
            </FgButton>
          </span>
        </div>
      }
      icon={<KeyRound aria-hidden className="h-5 w-5 text-primary-strong" />}
      open={open}
      size="sm"
      title="비밀번호 초기화"
      titleMeta={titleMeta}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading) onClose()
      }}
    >
      <div className="space-y-4">
        <FgNotice tone="warning">
          임시 비밀번호가 새로 발급되고 계정 상태가 PENDING으로 변경됩니다.
        </FgNotice>
        {user ? (
          <div className="rounded-control border border-line-soft bg-background px-4 py-3">
            <span className="text-meta font-semibold text-muted">대상 사용자</span>
            <p className="mt-1 text-body font-extrabold text-ink">
              {user.name} · {user.employeeNo.toUpperCase()}
            </p>
            <p className="mt-1 text-label text-muted">{user.email}</p>
          </div>
        ) : null}
        {errorMessage ? <FgNotice tone="danger">{errorMessage}</FgNotice> : null}
      </div>
    </FgModal>
  )
}
