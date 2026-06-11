import { FgBadge } from '@/shared/ui'

import type { WarehouseType } from '../model/types'

export function WarehouseTypeBadge({ type }: { type: WarehouseType }) {
  if (type === 'HQ') {
    return <FgBadge variant="navy">HQ</FgBadge>
  }

  return <span className="text-table font-semibold tracking-wide text-ink-2">DEALER</span>
}

export function WarehouseActiveBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <FgBadge dot variant="success">
        활성
      </FgBadge>
    )
  }

  return (
    <FgBadge dot variant="off">
      비활성
    </FgBadge>
  )
}
