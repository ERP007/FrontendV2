import { CheckCircle2, Copy, Download, KeyRound, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  DEFAULT_USER_FILTER,
  filterUsers,
  getCreateUserErrorMessage,
  getUserTenancyLabel,
  USER_FIXTURES,
  UserCreateModal,
  UserFilterBar,
  UserTable,
  useCreateUserMutation,
} from '@/features/user'
import type { User, UserFilter, UserFormValues } from '@/features/user'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '관리' }, { label: '사용자' }, { label: '사용자 목록' }]
type ToastId = string | number

function nextEmpNo(users: User[]): string {
  const max = users.reduce((highest, user) => {
    const numeric = Number(user.empNo.replace(/\D/g, ''))
    return Number.isNaN(numeric) ? highest : Math.max(highest, numeric)
  }, 0)

  return `HMC${String(max + 1).padStart(4, '0')}`
}

function maskTemporaryPassword(password: string) {
  return '●'.repeat(Math.max(8, password.length))
}

function copyTextFallback(text: string) {
  const textarea = document.createElement('textarea')

  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  const copied = document.execCommand('copy')

  document.body.removeChild(textarea)

  if (!copied) {
    throw new Error('copy failed')
  }
}

async function copyTemporaryPassword(password: string, toastId: ToastId) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(password)
    } else {
      copyTextFallback(password)
    }

    toast.dismiss(toastId)
    toast.success('임시 비밀번호가 복사되었습니다.')
  } catch {
    toast.error('임시 비밀번호를 복사하지 못했습니다.')
  }
}

function showUserCreationResultToast(temporaryPassword: string) {
  const maskedPassword = maskTemporaryPassword(temporaryPassword)

  toast.custom(
    (toastId) => (
      <section className="w-80 rounded-card border border-line bg-surface p-4 shadow-popover">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-success-bg text-success">
            <CheckCircle2 aria-hidden className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-body font-extrabold text-ink">사용자 등록 완료</p>
            <p className="mt-1 text-label text-muted">초기 비밀번호를 안전하게 전달해 주세요.</p>
          </div>
        </div>
        <div className="mt-4 rounded-control border border-line-soft bg-background px-3.5 py-3">
          <span className="flex items-center gap-1.5 text-meta font-semibold text-muted">
            <KeyRound aria-hidden className="h-3.5 w-3.5" />
            임시 비밀번호
          </span>
          <strong className="mt-1 block text-body tracking-widest text-ink">{maskedPassword}</strong>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <FgButton size="sm" onClick={() => toast.dismiss(toastId)}>
            닫기
          </FgButton>
          <FgButton
            leftIcon={<Copy aria-hidden className="h-4 w-4" />}
            size="sm"
            variant="primary"
            onClick={() => void copyTemporaryPassword(temporaryPassword, toastId)}
          >
            비밀번호 복사
          </FgButton>
        </div>
      </section>
    ),
    { duration: Infinity },
  )
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(USER_FIXTURES)
  const [filter, setFilter] = useState<UserFilter>(DEFAULT_USER_FILTER)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createOpen, setCreateOpen] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)
  const createUserMutation = useCreateUserMutation()

  const filtered = useMemo(() => filterUsers(users, filter), [users, filter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  function handleFilterChange(next: UserFilter) {
    setFilter(next)
    setPage(1)
  }

  async function handleCreate(values: UserFormValues) {
    if (users.some((user) => user.empNo === values.empNo)) {
      setCreateErrorMessage('이미 존재하는 사번입니다.')
      return
    }

    setCreateErrorMessage(null)

    try {
      const response = await createUserMutation.mutateAsync(values)

      setUsers((previous) => [
        ...previous,
        {
          email: values.email,
          empNo: values.empNo,
          id: Math.max(0, ...previous.map((user) => user.id)) + 1,
          joinedAt: new Date().toISOString().slice(0, 10),
          name: values.name,
          rank: values.rank || null,
          role: values.role,
          status: 'PENDING',
          warehouseName: getUserTenancyLabel(values.tenancyCode),
        },
      ])
      setCreateOpen(false)

      if (values.passwordMode === 'AUTO' && response.temporaryPassword) {
        showUserCreationResultToast(response.temporaryPassword)
        return
      }

      toast.success('사용자가 등록되었습니다. 첫 로그인 시 비밀번호 변경이 필요합니다.')
    } catch (error) {
      setCreateErrorMessage(getCreateUserErrorMessage(error))
    }
  }

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, filtered.length)

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <>
            <FgButton
              leftIcon={<Download aria-hidden className="h-4 w-4" />}
              onClick={() => toast.info('내보내기는 백엔드 연동 후 제공됩니다.')}
            >
              내보내기
            </FgButton>
            <FgButton
              leftIcon={<Plus aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={() => {
                setCreateErrorMessage(null)
                setCreateOpen(true)
              }}
            >
              사용자 추가
            </FgButton>
          </>
        }
        breadcrumbs={breadcrumbs}
        title="사용자 목록"
      />
      <UserFilterBar
        filter={filter}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(DEFAULT_USER_FILTER)}
      />
      <UserTable
        header={
          <span>
            전체 <strong className="text-ink">{formatNumber(filtered.length)}</strong>명 중 {rangeStart}–
            {rangeEnd}
          </span>
        }
        users={pageRows}
      />
      <FgPagination
        page={page}
        pageSize={pageSize}
        totalCount={filtered.length}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
      <UserCreateModal
        errorMessage={createErrorMessage}
        loading={createUserMutation.isPending}
        nextEmpNo={nextEmpNo(users)}
        open={createOpen}
        onClose={() => {
          setCreateErrorMessage(null)
          setCreateOpen(false)
        }}
        onSubmit={handleCreate}
      />
    </div>
  )
}
