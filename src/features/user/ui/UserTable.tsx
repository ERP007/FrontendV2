import { Ban, Eye, KeyRound, RotateCcw } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { formatDate } from '@/shared/lib/format'
import { FgAvatar, FgDataTable, FgDropdownMenu, FgEmptyState, FgStatusBadge } from '@/shared/ui'

import type { UserListItem, UserSortBy, UserSortDirection } from '../model/types'

export interface UserTableProps {
  currentEmployeeNo?: string
  errorMessage?: string | null
  header?: ReactNode
  loading?: boolean
  onEditUser?: (user: UserListItem) => void
  onResetPassword?: (user: UserListItem) => void
  onSortChange?: (sortBy: UserSortBy, sortDirection: UserSortDirection) => void
  onToggleSuspension?: (user: UserListItem) => void
  sortBy?: UserSortBy
  sortDirection?: UserSortDirection
  users: UserListItem[]
}

const sortableColumns = new Set<UserSortBy>(['employeeNo', 'name', 'joinedAt'])

function isUserSortBy(value: string): value is UserSortBy {
  return sortableColumns.has(value as UserSortBy)
}

function normalizeEmployeeNo(value: string) {
  return value.trim().toUpperCase()
}

export function UserTable({
  currentEmployeeNo,
  errorMessage,
  header,
  loading = false,
  onEditUser,
  onResetPassword,
  onSortChange,
  onToggleSuspension,
  sortBy,
  sortDirection,
  users,
}: UserTableProps) {
  const sorting = sortBy ? [{ desc: sortDirection === 'DESC', id: sortBy }] : []
  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        accessorKey: 'employeeNo',
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-extrabold text-ink">{row.original.employeeNo.toUpperCase()}</span>
        ),
        enableSorting: true,
        header: '사번',
        size: 110,
      },
      {
        accessorKey: 'name',
        cell: ({ row }) => {
          const isSelf =
            currentEmployeeNo &&
            normalizeEmployeeNo(row.original.employeeNo) === normalizeEmployeeNo(currentEmployeeNo)

          return (
            <span className="flex min-w-56 items-center gap-3.5 whitespace-nowrap pr-7">
              <FgAvatar size="sm" />
              <strong className="shrink-0 whitespace-nowrap font-extrabold text-ink">{row.original.name}</strong>
              {isSelf ? (
                <span className="inline-flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-pill border border-primary-line bg-primary-soft px-2.5 text-micro font-extrabold text-primary-strong">
                  본인
                </span>
              ) : null}
            </span>
          )
        },
        enableSorting: true,
        header: '이름',
        size: 240,
      },
      {
        accessorKey: 'email',
        cell: ({ row }) => <span className="block truncate font-medium text-muted">{row.original.email}</span>,
        header: '이메일',
        size: 260,
      },
      {
        accessorKey: 'department',
        cell: ({ row }) => <span className="whitespace-nowrap font-medium text-ink-2">{row.original.department}</span>,
        header: '소속',
        size: 160,
      },
      {
        accessorKey: 'role',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-table font-extrabold tracking-wide text-ink-2">{row.original.role}</span>
        ),
        header: 'Role',
        size: 180,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => <FgStatusBadge status={row.original.status} />,
        header: '상태',
        meta: { cellClassName: 'whitespace-nowrap', headClassName: 'whitespace-nowrap' },
        size: 140,
      },
      {
        accessorKey: 'joinedAt',
        cell: ({ row }) => <span className="whitespace-nowrap font-medium text-muted">{formatDate(row.original.joinedAt)}</span>,
        enableSorting: true,
        header: '가입일',
        size: 130,
      },
      {
        cell: ({ row }) => {
          const user = row.original
          const isSelf =
            currentEmployeeNo &&
            normalizeEmployeeNo(user.employeeNo) === normalizeEmployeeNo(currentEmployeeNo)
          const isSuspended = user.status === 'SUSPENDED'
          const isAdmin = user.role === 'ADMIN'
          const resetPasswordBlockMessage = isSelf
            ? '본인 계정의 비밀번호를 초기화할 수 없습니다.'
            : null
          const suspendBlockMessage = isSelf
            ? '본인 계정의 정지 상태를 변경할 수 없습니다.'
            : isAdmin && !isSuspended
              ? '관리자 계정을 정지할 수 없습니다.'
              : null
          const suspensionLabel = isSuspended ? '정지 해제' : '계정 정지'
          const handleResetPasswordSelect = () => {
            if (resetPasswordBlockMessage) {
              toast.error(resetPasswordBlockMessage)
              return
            }

            onResetPassword?.(user)
          }
          const handleSuspendToggleSelect = () => {
            if (suspendBlockMessage) {
              toast.error(suspendBlockMessage)
              return
            }

            onToggleSuspension?.(user)
          }
          const actionItems = [
            ...(onEditUser
              ? [
                  {
                    icon: <Eye aria-hidden className="h-4 w-4" />,
                    label: '유저 상세',
                    onSelect: () => onEditUser(user),
                  },
                ]
              : []),
            {
              ariaDisabled: Boolean(resetPasswordBlockMessage),
              disabled: !onResetPassword,
              icon: <KeyRound aria-hidden className="h-4 w-4" />,
              label: '비밀번호 초기화',
              onSelect: handleResetPasswordSelect,
            },
            {
              ariaDisabled: Boolean(suspendBlockMessage),
              danger: !isSuspended,
              disabled: !onToggleSuspension,
              icon: isSuspended ? (
                <RotateCcw aria-hidden className="h-4 w-4" />
              ) : (
                <Ban aria-hidden className="h-4 w-4" />
              ),
              label: suspensionLabel,
              onSelect: handleSuspendToggleSelect,
              separatorBefore: true,
            },
          ]

          return <FgDropdownMenu items={actionItems} />
        },
        header: '액션',
        id: 'actions',
        meta: { align: 'center' },
        size: 70,
      },
    ],
    [currentEmployeeNo, onEditUser, onResetPassword, onToggleSuspension],
  )

  const emptyState = errorMessage ? (
    <FgEmptyState
      description={errorMessage}
      title="사용자 목록을 불러오지 못했습니다"
    />
  ) : loading ? (
    <FgEmptyState title="사용자 목록을 불러오는 중입니다" description="잠시만 기다려 주세요" />
  ) : (
    <FgEmptyState title="조건에 맞는 사용자가 없습니다" description="검색어 또는 필터를 변경해 보세요" />
  )

  return (
    <FgDataTable
      columns={columns}
      data={loading && users.length === 0 ? [] : users}
      emptyState={emptyState}
      enableSortingRemoval={false}
      header={header}
      manualSorting
      sorting={sorting}
      onSortingChange={(nextSorting) => {
        const next = nextSorting[0]

        if (!next || !isUserSortBy(next.id)) {
          return
        }

        onSortChange?.(next.id, next.desc ? 'DESC' : 'ASC')
      }}
    />
  )
}
