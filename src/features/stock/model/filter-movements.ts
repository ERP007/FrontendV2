import dayjs from 'dayjs'

import type { Movement, MovementFilter } from './types'

/** swagger 기본값(시작일 30일 전 ~ 오늘)을 따르는 초기 필터 */
export function createDefaultMovementFilter(): MovementFilter {
  return {
    from: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    keyword: '',
    to: dayjs().format('YYYY-MM-DD'),
    type: 'ALL',
    warehouseCode: 'ALL',
  }
}

export function filterMovements(movements: Movement[], filter: MovementFilter): Movement[] {
  const keyword = filter.keyword.trim().toLowerCase()
  const from = filter.from ? dayjs(filter.from).startOf('day') : null
  const to = filter.to ? dayjs(filter.to).endOf('day') : null

  return movements
    .filter((movement) => {
      if (keyword) {
        const matches =
          movement.itemName.toLowerCase().includes(keyword) ||
          movement.sku.toLowerCase().includes(keyword)
        if (!matches) return false
      }

      if (filter.warehouseCode !== 'ALL' && movement.warehouseCode !== filter.warehouseCode) {
        return false
      }
      if (filter.type !== 'ALL' && movement.type !== filter.type) return false

      const occurredAt = dayjs(movement.occurredAt)
      if (from && occurredAt.isBefore(from)) return false
      if (to && occurredAt.isAfter(to)) return false

      return true
    })
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
}

export interface MovementDateGroup {
  count: number
  date: string
  isToday: boolean
  movements: Movement[]
}

/** 최신순 이력을 날짜별 그룹(IV-03 날짜 그룹 헤더)으로 묶는다. */
export function groupMovementsByDate(movements: Movement[]): MovementDateGroup[] {
  const groups = new Map<string, Movement[]>()

  for (const movement of movements) {
    const date = dayjs(movement.occurredAt).format('YYYY-MM-DD')
    const group = groups.get(date)
    if (group) {
      group.push(movement)
    } else {
      groups.set(date, [movement])
    }
  }

  const today = dayjs().format('YYYY-MM-DD')

  return Array.from(groups.entries()).map(([date, grouped]) => ({
    count: grouped.length,
    date,
    isToday: date === today,
    movements: grouped,
  }))
}
