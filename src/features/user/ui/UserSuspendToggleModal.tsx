import { Check, RotateCcw, UserX } from 'lucide-react'

import { FgButton, FgModal, FgNotice } from '@/shared/ui'

import type { UserListItem } from '../model/types'

export interface UserSuspendToggleModalProps {
  errorMessage?: string | null
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
  open: boolean
  user: UserListItem | null
}

export function UserSuspendToggleModal({
  errorMessage,
  loading = false,
  onClose,
  onConfirm,
  open,
  user,
}: UserSuspendToggleModalProps) {
  const isRelease = user?.status === 'SUSPENDED'
  const title = isRelease ? '계정 정지 해제' : '계정 정지'
  const titleMeta = user ? (
    <span className="rounded-control bg-line-soft px-2 py-1 text-label font-semibold text-muted">
      {user.employeeNo.toUpperCase()}
    </span>
  ) : null

  return (
    <FgModal
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <FgButton disabled={loading} onClick={onClose}>
            취소
          </FgButton>
          <FgButton
            leftIcon={<Check aria-hidden className="h-4 w-4" />}
            loading={loading}
            variant={isRelease ? 'primary' : 'dangerSolid'}
            onClick={onConfirm}
          >
            {isRelease ? '정지 해제' : '정지'}
          </FgButton>
        </div>
      }
      icon={
        isRelease ? (
          <RotateCcw aria-hidden className="h-5 w-5 text-primary-strong" />
        ) : (
          <UserX aria-hidden className="h-5 w-5 text-danger" />
        )
      }
      open={open}
      size="sm"
      title={title}
      titleMeta={titleMeta}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading) onClose()
      }}
    >
      <div className="space-y-4">
        <FgNotice tone={isRelease ? 'info' : 'danger'}>
          {isRelease
            ? '확인하면 사용자의 계정 정지 상태가 해제됩니다.'
            : '확인하면 해당 사용자는 서비스를 이용할 수 없습니다.'}
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
