import { RotateCcw, Search } from 'lucide-react'

import { ROLE_LABELS } from '@/shared/config/session'
import type { UserRole } from '@/shared/config/session'
import { FgButton, FgCard, FgInput, FgSelect } from '@/shared/ui'

import { BELONG_OPTIONS } from '../model/fixtures'

import type { UserFilter, UserStatus } from '../model/types'

const roleOptions = [
  { label: 'Role : 전체', value: 'ALL' },
  ...(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({
    label: `${role} · ${ROLE_LABELS[role]}`,
    value: role,
  })),
]

const statusOptions = [
  { label: '상태 : 전체', value: 'ALL' },
  { label: 'ACTIVE · 활성', value: 'ACTIVE' },
  { label: 'PENDING · 대기', value: 'PENDING' },
  { label: 'SUSPENDED · 정지', value: 'SUSPENDED' },
]

const belongOptions = [
  { label: '소속 : 전체', value: 'ALL' },
  ...BELONG_OPTIONS.map((name) => ({ label: name, value: name })),
]

export interface UserFilterBarProps {
  filter: UserFilter
  onChange: (filter: UserFilter) => void
  onReset: () => void
}

export function UserFilterBar({ filter, onChange, onReset }: UserFilterBarProps) {
  return (
    <FgCard className="flex items-center gap-3 p-4">
      <FgInput
        leftIcon={<Search aria-hidden className="h-4 w-4" />}
        placeholder="이름 또는 사번"
        rootClassName="flex-1"
        value={filter.keyword}
        onChange={(event) => onChange({ ...filter, keyword: event.target.value })}
      />
      <FgSelect
        className="w-52"
        options={roleOptions}
        value={filter.role}
        onValueChange={(value) => onChange({ ...filter, role: value as UserFilter['role'] })}
      />
      <FgSelect
        className="w-48"
        options={belongOptions}
        value={filter.warehouseName}
        onValueChange={(value) => onChange({ ...filter, warehouseName: value })}
      />
      <FgSelect
        className="w-48"
        options={statusOptions}
        value={filter.status}
        onValueChange={(value) =>
          onChange({ ...filter, status: value as 'ALL' | UserStatus })
        }
      />
      <FgButton leftIcon={<RotateCcw aria-hidden className="h-4 w-4" />} onClick={onReset}>
        초기화
      </FgButton>
    </FgCard>
  )
}
