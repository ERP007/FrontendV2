import { KeyRound, Pencil, UserX } from 'lucide-react'
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { formatDate } from '@/shared/lib/format'
import { FgAvatar, FgDataTable, FgDropdownMenu, FgStatusBadge } from '@/shared/ui'

import type { User } from '../model/types'

export interface UserTableProps {
  header?: ReactNode
  users: User[]
}

export function UserTable({ header, users }: UserTableProps) {
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'empNo',
        cell: ({ row }) => <span className="font-semibold text-ink">{row.original.empNo}</span>,
        enableSorting: true,
        header: '사번',
        size: 110,
      },
      {
        accessorKey: 'name',
        cell: ({ row }) => (
          <span className="flex items-center gap-2.5">
            <FgAvatar size="sm" />
            <span className="font-semibold text-ink">{row.original.name}</span>
          </span>
        ),
        enableSorting: true,
        header: '이름',
        size: 160,
      },
      {
        accessorKey: 'email',
        cell: ({ row }) => <span className="font-medium text-muted">{row.original.email}</span>,
        header: '이메일',
      },
      {
        accessorKey: 'warehouseName',
        cell: ({ row }) => <span className="font-medium text-ink-2">{row.original.warehouseName}</span>,
        header: '소속',
        size: 140,
      },
      {
        accessorKey: 'role',
        cell: ({ row }) => (
          <span className="text-table font-semibold tracking-wide text-ink-2">{row.original.role}</span>
        ),
        header: 'Role',
        size: 170,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => <FgStatusBadge status={row.original.status} />,
        header: '상태',
        size: 130,
      },
      {
        accessorKey: 'joinedAt',
        cell: ({ row }) => <span className="font-medium text-muted">{formatDate(row.original.joinedAt)}</span>,
        enableSorting: true,
        header: '가입일',
        size: 110,
      },
      {
        cell: () => (
          <FgDropdownMenu
            items={[
              { icon: <Pencil aria-hidden className="h-4 w-4" />, label: '정보 수정' },
              { icon: <KeyRound aria-hidden className="h-4 w-4" />, label: '비밀번호 초기화' },
              { danger: true, icon: <UserX aria-hidden className="h-4 w-4" />, label: '계정 정지' },
            ]}
          />
        ),
        header: '액션',
        id: 'actions',
        meta: { align: 'center' },
        size: 70,
      },
    ],
    [],
  )

  return <FgDataTable columns={columns} data={users} header={header} />
}
